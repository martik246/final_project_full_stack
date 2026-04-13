from django.urls import path

from .views import (
    csrf_view,
    login_view,
    logout_view,
    me_view,
    password_reset_confirm_view,
    password_reset_request_view,
    register_view,
)

urlpatterns = [
    path("csrf/", csrf_view, name="csrf"),
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("password-reset/request/", password_reset_request_view, name="password-reset-request"),
    path("password-reset/confirm/", password_reset_confirm_view, name="password-reset-confirm"),
    path("logout/", logout_view, name="logout"),
    path("me/", me_view, name="me"),
]
