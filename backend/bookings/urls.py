from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AvailabilitySlotViewSet, BookingViewSet, ServiceViewSet, api_root

router = DefaultRouter()
router.register("services", ServiceViewSet, basename="service")
router.register("slots", AvailabilitySlotViewSet, basename="slot")
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("", api_root, name="api-root"),
    *router.urls,
]
