from django.test import override_settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationApiTests(APITestCase):
    def test_user_can_register_and_is_logged_in(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "demo_customer",
                "first_name": "Demo",
                "last_name": "Customer",
                "email": "demo@example.com",
                "password": "strong-pass-123",
                "password_confirm": "strong-pass-123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data["user"]["role"], User.Role.CUSTOMER)

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["username"], "demo_customer")

    def test_user_can_log_in_with_valid_credentials(self):
        user = User.objects.create_user(
            username="staff_user",
            password="strong-pass-123",
            role=User.Role.STAFF,
        )

        response = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": "strong-pass-123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["role"], User.Role.STAFF)

    @override_settings(DEBUG=True)
    def test_password_reset_request_returns_debug_preview_for_existing_user(self):
        user = User.objects.create_user(
            username="reset_user",
            email="reset@example.com",
            password="strong-pass-123",
        )

        response = self.client.post(
            "/api/auth/password-reset/request/",
            {"email": user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("debug_reset_preview", response.data)
        self.assertEqual(response.data["debug_reset_preview"]["username"], user.username)

    def test_password_reset_confirm_updates_password(self):
        user = User.objects.create_user(
            username="reset_confirm_user",
            email="reset-confirm@example.com",
            password="strong-pass-123",
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "new_password": "brand-new-pass-456",
                "new_password_confirm": "brand-new-pass-456",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": "brand-new-pass-456"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
