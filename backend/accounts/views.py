import logging

from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegistrationSerializer,
    UserSerializer,
)

logger = logging.getLogger("accounts")


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_view(_request):
    return Response({"message": "CSRF cookie set."})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    login(request, user)
    logger.info("user_registered username=%s role=%s", user.username, user.role)

    return Response(
        {
            "message": "Registration completed successfully.",
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    login(request, user)
    logger.info("user_logged_in username=%s role=%s", user.username, user.role)

    return Response(
        {
            "message": "Login successful.",
            "user": UserSerializer(user).data,
        }
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_request_view(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.get_user()

    response_payload = {
        "message": "If an account with that email exists, a reset link has been prepared."
    }

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        logger.info("password_reset_requested username=%s", user.username)

        # BookEase note: in DEBUG we expose the token pieces to make the reset flow easy to demo.
        if settings.DEBUG:
            response_payload["debug_reset_preview"] = {
                "uid": uid,
                "token": token,
                "username": user.username,
            }

    return Response(response_payload)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset_confirm_view(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    logger.info("password_reset_completed username=%s", user.username)

    return Response({"message": "Password has been reset successfully."})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    logger.info("user_logged_out username=%s", request.user.username)
    logout(request)
    return Response({"message": "Logout successful."})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)
