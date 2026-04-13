import logging

from django.core.cache import cache
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import AvailabilitySlot, Booking, Service
from .serializers import (
    AvailabilitySlotSerializer,
    BookingSerializer,
    BookingStatusSerializer,
    ServiceSerializer,
)

logger = logging.getLogger("bookings")
SERVICE_LIST_CACHE_KEY = "bookease:services:list"
OPEN_SLOT_CACHE_KEY = "bookease:slots:open"


def invalidate_catalog_cache():
    cache.delete(SERVICE_LIST_CACHE_KEY)


def invalidate_slot_cache():
    cache.delete(OPEN_SLOT_CACHE_KEY)


class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in {"staff", "admin"}


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = (IsStaffOrReadOnly,)

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role in {"staff", "admin"}:
            return super().list(request, *args, **kwargs)

        cached_payload = cache.get(SERVICE_LIST_CACHE_KEY)
        if cached_payload is not None:
            logger.info("service_list_cache_hit")
            return Response(cached_payload)

        response = super().list(request, *args, **kwargs)
        cache.set(SERVICE_LIST_CACHE_KEY, response.data, timeout=300)
        logger.info("service_list_cache_populated")
        return response

    def perform_create(self, serializer):
        service = serializer.save()
        invalidate_catalog_cache()
        logger.info("service_created service_id=%s", service.id)

    def perform_update(self, serializer):
        service = serializer.save()
        invalidate_catalog_cache()
        logger.info("service_updated service_id=%s", service.id)

    def perform_destroy(self, instance):
        service_id = instance.id
        instance.delete()
        invalidate_catalog_cache()
        logger.info("service_deleted service_id=%s", service_id)


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = AvailabilitySlot.objects.select_related("staff_member").all()
    serializer_class = AvailabilitySlotSerializer
    permission_classes = (IsStaffOrReadOnly,)

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated or user.role == "customer":
            return self.queryset.filter(is_booked=False)
        if user.role == "staff":
            return self.queryset.filter(staff_member=user)
        return self.queryset

    def perform_create(self, serializer):
        user = self.request.user

        # BookEase note: staff members can only publish their own time slots.
        if user.role == "staff":
            slot = serializer.save(staff_member=user)
            invalidate_slot_cache()
            logger.info("slot_created_by_staff user=%s slot_id=%s", user.username, slot.id)
            return

        slot = serializer.save()
        invalidate_slot_cache()
        logger.info("slot_created_by_admin user=%s slot_id=%s", user.username, slot.id)

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role in {"staff", "admin"}:
            return super().list(request, *args, **kwargs)

        cached_payload = cache.get(OPEN_SLOT_CACHE_KEY)
        if cached_payload is not None:
            logger.info("slot_list_cache_hit")
            return Response(cached_payload)

        response = super().list(request, *args, **kwargs)
        cache.set(OPEN_SLOT_CACHE_KEY, response.data, timeout=180)
        logger.info("slot_list_cache_populated")
        return response

    def perform_update(self, serializer):
        slot = serializer.save()
        invalidate_slot_cache()
        logger.info("slot_updated slot_id=%s", slot.id)

    def perform_destroy(self, instance):
        slot_id = instance.id
        instance.delete()
        invalidate_slot_cache()
        logger.info("slot_deleted slot_id=%s", slot_id)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("customer", "service", "slot").all()
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user

        # BookEase note: customers only see their own bookings, while staff can manage platform activity.
        if user.role == "customer":
            return self.queryset.filter(customer=user)
        return self.queryset

    def perform_create(self, serializer):
        # BookEase note: the booking owner always comes from the current session user.
        if self.request.user.role != "customer":
            raise PermissionDenied("Only customers can create bookings.")
        booking = serializer.save(customer=self.request.user)
        invalidate_slot_cache()
        logger.info(
            "booking_created customer=%s booking_id=%s service_id=%s slot_id=%s",
            self.request.user.username,
            booking.id,
            booking.service_id,
            booking.slot_id,
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def confirm(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in {"staff", "admin"}:
            return Response(
                {"detail": "Only staff or admins can confirm bookings."},
                status=403,
            )

        booking.status = Booking.Status.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])
        logger.info("booking_confirmed booking_id=%s actor=%s", booking.id, request.user.username)
        return Response(BookingStatusSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in {"staff", "admin"}:
            return Response(
                {"detail": "Only staff or admins can reject bookings."},
                status=403,
            )

        booking.status = Booking.Status.REJECTED
        booking.slot.is_booked = False
        booking.slot.save(update_fields=["is_booked"])
        booking.save(update_fields=["status", "updated_at"])
        invalidate_slot_cache()
        logger.info("booking_rejected booking_id=%s actor=%s", booking.id, request.user.username)
        return Response(BookingStatusSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()

        if request.user.role == "customer" and booking.customer != request.user:
            return Response(
                {"detail": "You can only cancel your own bookings."},
                status=403,
            )

        booking.status = Booking.Status.CANCELLED
        booking.slot.is_booked = False
        booking.slot.save(update_fields=["is_booked"])
        booking.save(update_fields=["status", "updated_at"])
        invalidate_slot_cache()
        logger.info("booking_cancelled booking_id=%s actor=%s", booking.id, request.user.username)
        return Response(BookingStatusSerializer(booking).data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def api_root(_request):
    return Response(
        {
            "project": "BookEase",
            "message": "Service booking platform API is running.",
            "endpoints": {
                "auth": "/api/auth/",
                "services": "/api/services/",
                "availability": "/api/slots/",
                "bookings": "/api/bookings/",
            },
        }
    )
