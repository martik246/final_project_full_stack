from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from bookings.models import AvailabilitySlot, Booking, Service


class Command(BaseCommand):
    help = "Populate the project with demo users, services, slots, and sample bookings."

    def handle(self, *args, **options):
        self.stdout.write("Creating BookEase demo data...")

        admin_user, _ = User.objects.get_or_create(
            username="admin_demo",
            defaults={
                "email": "admin@bookease.local",
                "first_name": "Admin",
                "last_name": "Demo",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("strong-pass-123")
        admin_user.role = User.Role.ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        staff_user, _ = User.objects.get_or_create(
            username="staff_demo",
            defaults={
                "email": "staff@bookease.local",
                "first_name": "Staff",
                "last_name": "Demo",
                "role": User.Role.STAFF,
                "is_staff": True,
            },
        )
        staff_user.set_password("strong-pass-123")
        staff_user.role = User.Role.STAFF
        staff_user.is_staff = True
        staff_user.save()

        customer_user, _ = User.objects.get_or_create(
            username="customer_demo",
            defaults={
                "email": "customer@bookease.local",
                "first_name": "Customer",
                "last_name": "Demo",
                "role": User.Role.CUSTOMER,
            },
        )
        customer_user.set_password("strong-pass-123")
        customer_user.role = User.Role.CUSTOMER
        customer_user.save()

        services = [
            {
                "name": "Business Consultation",
                "description": "A focused consultation session for business planning.",
                "duration_minutes": 60,
                "price": "59.99",
            },
            {
                "name": "Website Review",
                "description": "A practical audit of an existing business website.",
                "duration_minutes": 45,
                "price": "39.99",
            },
            {
                "name": "Digital Strategy Session",
                "description": "A guided session for marketing and digital workflow decisions.",
                "duration_minutes": 90,
                "price": "89.99",
            },
        ]

        created_services = []
        for payload in services:
            service, _ = Service.objects.get_or_create(name=payload["name"], defaults=payload)
            created_services.append(service)

        slot_times = [
            (1, 10),
            (1, 13),
            (2, 11),
            (3, 15),
        ]
        created_slots = []
        for day_offset, hour in slot_times:
            start_time = timezone.now().replace(minute=0, second=0, microsecond=0) + timedelta(
                days=day_offset
            )
            start_time = start_time.replace(hour=hour)
            slot, _ = AvailabilitySlot.objects.get_or_create(
                staff_member=staff_user,
                start_time=start_time,
                defaults={
                    "end_time": start_time + timedelta(hours=1),
                    "is_booked": False,
                },
            )
            created_slots.append(slot)

        first_slot = created_slots[0]
        first_slot.is_booked = True
        first_slot.save(update_fields=["is_booked"])

        Booking.objects.get_or_create(
            customer=customer_user,
            service=created_services[0],
            slot=first_slot,
            defaults={
                "status": Booking.Status.PENDING,
                "notes": "Demo booking created by seed command.",
            },
        )

        self.stdout.write(self.style.SUCCESS("BookEase demo data created."))
        self.stdout.write("Users:")
        self.stdout.write("  admin_demo / strong-pass-123")
        self.stdout.write("  staff_demo / strong-pass-123")
        self.stdout.write("  customer_demo / strong-pass-123")
