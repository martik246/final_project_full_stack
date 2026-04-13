from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import AvailabilitySlot, Booking, Service


class BookingApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.customer = User.objects.create_user(
            username="customer_one",
            password="strong-pass-123",
            role=User.Role.CUSTOMER,
        )
        self.other_customer = User.objects.create_user(
            username="customer_two",
            password="strong-pass-123",
            role=User.Role.CUSTOMER,
        )
        self.staff = User.objects.create_user(
            username="staff_one",
            password="strong-pass-123",
            role=User.Role.STAFF,
        )
        self.service = Service.objects.create(
            name="Business Consultation",
            description="A one-hour service planning session.",
            duration_minutes=60,
            price="49.99",
        )
        self.slot = AvailabilitySlot.objects.create(
            staff_member=self.staff,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
        )

    def test_customer_can_create_booking_for_open_slot(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/bookings/",
            {
                "service": self.service.id,
                "slot": self.slot.id,
                "notes": "Please prepare onboarding materials.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_booked)
        self.assertEqual(Booking.objects.get().customer, self.customer)

    def test_staff_cannot_create_customer_booking(self):
        self.client.force_authenticate(user=self.staff)

        response = self.client.post(
            "/api/bookings/",
            {
                "service": self.service.id,
                "slot": self.slot.id,
                "notes": "Trying to book as staff.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_only_sees_own_bookings(self):
        Booking.objects.create(
            customer=self.customer,
            service=self.service,
            slot=self.slot,
        )
        self.slot.is_booked = True
        self.slot.save(update_fields=["is_booked"])

        self.client.force_authenticate(user=self.other_customer)
        response = self.client.get("/api/bookings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_customer_only_sees_open_slots(self):
        AvailabilitySlot.objects.create(
            staff_member=self.staff,
            start_time=timezone.now() + timedelta(days=2),
            end_time=timezone.now() + timedelta(days=2, hours=1),
            is_booked=True,
        )

        self.client.force_authenticate(user=self.customer)
        response = self.client.get("/api/slots/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_staff_slot_creation_uses_authenticated_staff_member(self):
        self.client.force_authenticate(user=self.staff)

        response = self.client.post(
            "/api/slots/",
            {
                "staff_member": self.other_customer.id,
                "start_time": (timezone.now() + timedelta(days=3)).isoformat(),
                "end_time": (timezone.now() + timedelta(days=3, hours=1)).isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_slot = AvailabilitySlot.objects.order_by("-id").first()
        self.assertEqual(created_slot.staff_member, self.staff)

    def test_staff_can_confirm_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            service=self.service,
            slot=self.slot,
        )
        self.slot.is_booked = True
        self.slot.save(update_fields=["is_booked"])

        self.client.force_authenticate(user=self.staff)
        response = self.client.post(f"/api/bookings/{booking.id}/confirm/")

        booking.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(booking.status, Booking.Status.CONFIRMED)

    def test_reject_reopens_the_slot(self):
        booking = Booking.objects.create(
            customer=self.customer,
            service=self.service,
            slot=self.slot,
        )
        self.slot.is_booked = True
        self.slot.save(update_fields=["is_booked"])

        self.client.force_authenticate(user=self.staff)
        response = self.client.post(f"/api/bookings/{booking.id}/reject/")

        booking.refresh_from_db()
        self.slot.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(booking.status, Booking.Status.REJECTED)
        self.assertFalse(self.slot.is_booked)

    def test_customer_cannot_confirm_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            service=self.service,
            slot=self.slot,
        )

        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f"/api/bookings/{booking.id}/confirm/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_service_list_cache_is_invalidated_after_service_creation(self):
        self.client.get("/api/services/")
        cached_services = cache.get("bookease:services:list")
        self.assertIsNotNone(cached_services)

        self.client.force_authenticate(user=self.staff)
        response = self.client.post(
            "/api/services/",
            {
                "name": "Strategy Sprint",
                "description": "A short planning session.",
                "duration_minutes": 30,
                "price": "29.99",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(cache.get("bookease:services:list"))

    def test_open_slot_cache_is_invalidated_after_booking_creation(self):
        self.client.get("/api/slots/")
        cached_slots = cache.get("bookease:slots:open")
        self.assertIsNotNone(cached_slots)

        self.client.force_authenticate(user=self.customer)
        response = self.client.post(
            "/api/bookings/",
            {
                "service": self.service.id,
                "slot": self.slot.id,
                "notes": "Cache invalidation test booking.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(cache.get("bookease:slots:open"))
