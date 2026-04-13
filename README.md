# BookEase

I created BookEase as a full-stack service booking platform for my final project in Web Technology in Business and Web Application Development. In this project, I solve appointment management for service-based businesses through a centralized workflow where customers book services, staff manage availability, and administrators oversee the platform.

## Project Summary

In BookEase, I address a real business problem: many small businesses still coordinate appointments through phone calls or messaging, which leads to scheduling conflicts, missed requests, and weak operational visibility. I replace that manual process with a structured digital booking flow.

## Main Roles

- `customer`
- `staff`
- `admin`

## Main Models

- `User`
- `Service`
- `AvailabilitySlot`
- `Booking`

## Implemented Features

- registration, login, logout, and password reset
- role-based access control
- service catalog
- slot management
- booking creation, confirmation, rejection, and cancellation
- React workspace for customer and staff/admin actions
- Django admin support
- Docker-ready multi-service setup
- Redis-ready caching
- structured backend logging
- backend and frontend automated tests

## Local Development

For quick local startup you can use:

```bash
start_bookease.bat
```

or

```bash
powershell -ExecutionPolicy Bypass -File .\start_bookease.ps1
```

### Backend

```bash
copy .env.dev .env
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### Frontend

```bash
copy .env.dev .env
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
cd backend
python manage.py test
```

```bash
cd frontend
npm run test
```

## Demo Credentials

After running `python manage.py seed_demo`, use these accounts:

- `admin_demo / strong-pass-123`
- `staff_demo / strong-pass-123`
- `customer_demo / strong-pass-123`

## Docker Setup

```bash
copy .env.prod .env
docker compose up --build
```

Then run:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_demo
```

## Recommended Demo Flow

1. Start the backend and frontend locally.
2. Open the React application.
3. Log in as `customer_demo` and create a booking.
4. Log in as `staff_demo` and confirm or reject the booking.
5. Log in as `admin_demo` and create a new service or slot.
6. Demonstrate the password reset flow in debug mode.

I prepared a more presentation-friendly version in `docs/DEMO_SCRIPT.md`.

## API Areas

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/password-reset/request/`
- `POST /api/auth/password-reset/confirm/`
- `GET /api/auth/me/`
- `GET /api/services/`
- `POST /api/services/`
- `GET /api/slots/`
- `POST /api/slots/`
- `GET /api/bookings/`
- `POST /api/bookings/`
- `POST /api/bookings/{id}/confirm/`
- `POST /api/bookings/{id}/reject/`
- `POST /api/bookings/{id}/cancel/`

## Business Rules

- new users register as `customer` by default
- only customers can create bookings
- only staff and admin users can create or manage service slots
- staff and admin users can create services and slots from the React workspace
- customers only see their own bookings
- booked or inactive services cannot be used for new reservations
- rejecting or cancelling a booking reopens the slot
- the password reset flow exposes a debug preview token in local `DEBUG` mode for demonstration

## Caching and Logging

- the public service list is cached
- the public open-slot list is cached
- cache is invalidated after service, slot, and booking changes
- backend actions are written through structured logging
- static files are served in the production path through WhiteNoise

## Testing

- backend tests cover authentication, password reset, booking rules, permissions, and cache invalidation
- frontend tests cover guest-mode rendering and staff management workspace visibility

## Defense Materials

I also prepared project-defense support files in `docs/`:

- `ARCHITECTURE.md`
- `DEMO_SCRIPT.md`
- `DEFENSE_QA.md`
- `USE_CASES.md`
- `REPORT_DRAFT.md`
- `PRESENTATION_TEXT.md`
- `PRESENTATION_OUTLINE.md`

## Submission Notes

- use `.env.dev` for local development and `.env.prod` for containerized startup
- replace any placeholder student information in presentation/report files before submission
- use the documents in `docs/` as the basis for the final report and slides
- I added short explanatory comments in key places to make the project defense easier
