from django.contrib import admin

from .models import AvailabilitySlot, Booking, Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_minutes", "price", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("staff_member", "start_time", "end_time", "is_booked")
    list_filter = ("is_booked",)
    search_fields = ("staff_member__username",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("customer", "service", "slot", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("customer__username", "service__name")
