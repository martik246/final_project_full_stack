# BookEase Architecture

## System Overview

I organized BookEase as a multi-service full-stack application:

- `frontend` renders the React user interface and communicates with the backend over HTTP
- `backend` exposes the Django REST API, authentication, admin tools, and business rules
- `db` stores persistent application data in PostgreSQL for containerized environments
- `redis` provides caching support for high-read endpoints
- `nginx` acts as a reverse proxy for the frontend, backend API, admin panel, and static files

## Main Architectural Layers

### Frontend Layer

- React application for customer and staff/admin interactions
- Session-based authentication using Django session cookies
- Role-aware interface:
  - customers can browse services and create bookings
  - staff and admins can create services and availability slots

### Backend Layer

- Django REST Framework API
- Django admin for direct data management
- Role-based permissions in the booking workflow
- Password reset endpoints for account recovery

### Data Layer

Core models:

- `User`
- `Service`
- `AvailabilitySlot`
- `Booking`

Relationships:

- a `User` can own many bookings
- a `staff` user can own many availability slots
- a booking belongs to one service and one slot
- a slot can be booked only once at a time

## Business Flow

1. Customer registers or logs in
2. Customer views active services
3. Customer selects an open slot
4. Customer creates a booking request
5. Staff or admin confirms or rejects the request
6. Slot status updates based on booking status

## Security Notes

- password hashing is handled by Django
- session authentication is protected with CSRF tokens
- role-based access is enforced in API views
- environment-specific values are expected in `.env`
- Django ORM protects against raw SQL injection in standard flows

## Caching Strategy

I currently cache the following in BookEase:

- public service list
- public open-slot list

Cache invalidation happens when:

- a service is created, updated, or deleted
- a slot is created, updated, or deleted
- a booking changes slot availability

## Logging Strategy

I configured structured logging for:

- account registration and login events
- password reset activity
- service and slot creation
- booking creation and status changes

## Deployment Path

The repository includes:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

This setup supports my local multi-container deployment with backend, frontend, PostgreSQL, Redis, and Nginx.
