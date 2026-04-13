# BookEase Demo Script

## Goal

I prepared this file as a ready-to-use live demo sequence for my project defense.

## Before the Demo

Run:

```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Demo Accounts

- `customer_demo / strong-pass-123`
- `staff_demo / strong-pass-123`
- `admin_demo / strong-pass-123`

## Live Demo Flow

### 1. Show the landing workspace

- open the React frontend
- explain that the page already reflects role-aware project functionality
- briefly point out the authentication, booking, management, and workflow sections

### 2. Customer scenario

- log in as `customer_demo`
- show available services
- choose a service
- choose an open slot
- create a booking request
- show that the booking appears in the workflow section

Talking point:
`Customer users can only create and manage their own bookings.`

### 3. Staff scenario

- log out
- log in as `staff_demo`
- show that staff can see slot and booking workflow data
- confirm or reject the customer booking
- create a new availability slot from the React management panel

Talking point:
`Staff users manage availability and booking decisions, but they do not create customer bookings.`

### 4. Admin scenario

- log out
- log in as `admin_demo`
- create a new service from the React management panel
- mention that admin can also manage data from Django admin

Talking point:
`Admin users oversee services, slots, users, and operational control.`

### 5. Password reset scenario

- log out
- use the password reset request form with one of the demo emails
- show the debug reset preview token in local development
- use the token in the reset confirm form
- mention that in production this would be delivered by email

Talking point:
`The reset flow is implemented and easy to demonstrate locally without external mail services.`

### 6. Technical quality points

- mention Docker, PostgreSQL, Redis, and Nginx support
- mention structured logging
- mention public endpoint caching and invalidation
- mention backend automated tests

## Suggested Closing Sentence

With BookEase, I solve a real service-business scheduling problem and demonstrate frontend, backend, security, deployment, caching, logging, and testing in one integrated project.
