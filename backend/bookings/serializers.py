from rest_framework import serializers

from .models import AvailabilitySlot, Booking, Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = (
            "id",
            "name",
            "description",
            "duration_minutes",
            "price",
            "is_active",
        )


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    staff_member_username = serializers.CharField(
        source="staff_member.username",
        read_only=True,
    )

    class Meta:
        model = AvailabilitySlot
        fields = (
            "id",
            "staff_member",
            "staff_member_username",
            "start_time",
            "end_time",
            "is_booked",
        )
        read_only_fields = ("is_booked",)

    def validate(self, attrs):
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("Slot end time must be later than start time.")

        return attrs


class BookingSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "customer",
            "customer_username",
            "service",
            "service_name",
            "slot",
            "status",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("customer", "status", "created_at", "updated_at")

    def validate(self, attrs):
        slot = attrs["slot"]
        service = attrs["service"]

        # BookEase note: customers can only reserve time slots that are still open.
        if slot.is_booked:
            raise serializers.ValidationError("This time slot is already booked.")
        if not service.is_active:
            raise serializers.ValidationError("Inactive services cannot be booked.")

        return attrs

    def create(self, validated_data):
        slot = validated_data["slot"]
        slot.is_booked = True
        slot.save(update_fields=["is_booked"])
        return super().create(validated_data)


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ("id", "status", "notes", "updated_at")
        read_only_fields = ("id", "updated_at")
