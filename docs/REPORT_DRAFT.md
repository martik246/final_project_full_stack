# BookEase Technical Report Draft

## Cover Information

- Project title: `BookEase`
- Project type: full-stack service booking platform
- Student: `martik246`
- Program/Course: `IT Innovation in Business / Web Technology in Business / Web Application Development`

## 1. Introduction

I developed BookEase as a full-stack web application to solve appointment-management problems for service-based businesses. Many small organizations still handle bookings through phone calls, direct messaging, or manual spreadsheets. This approach often leads to scheduling conflicts, low transparency, and inefficient communication between customers and staff.

My goal in this project is to provide a centralized digital platform where customers can book services, staff can manage availability, and administrators can supervise operational data through a secure and structured system.

## 2. System Design

### 2.1 Problem Statement

The business problem I address in BookEase is the lack of a clear and centralized scheduling workflow in service businesses. Manual booking processes increase the risk of missed appointments, duplicated reservations, and poor record keeping.

### 2.2 Functional Architecture

I structured the system into the following layers:

- React frontend for user interaction
- Django REST backend for business logic and authentication
- PostgreSQL for persistent storage in containerized environments
- Redis for caching
- Nginx for reverse proxy routing

### 2.3 Main Actors

- `customer`
- `staff`
- `admin`

### 2.4 Main Features

- registration, login, logout
- password reset
- role-based access control
- service catalog
- availability slot management
- booking request creation and status management
- structured logging
- Redis-ready caching
- Docker-based deployment path

## 3. Implementation

### 3.1 Technology Choice

I selected React because it supports a dynamic user experience and a clear separation between UI and backend logic. I chose Django REST Framework because it provides robust tools for API development, authentication, permissions, and serialization. I included PostgreSQL, Redis, Docker, and Nginx to reflect a more production-oriented architecture.

### 3.2 Core Business Logic

The main business rules I implemented in the project are:

- customers can create bookings only for open slots
- staff and admins can manage services and availability slots
- staff and admins can confirm or reject bookings
- customers can cancel their own bookings
- rejecting or cancelling a booking reopens the slot

### 3.3 Security Considerations

The security-related implementation points I included are:

- password hashing through Django authentication
- password validation during registration and reset
- CSRF protection for state-changing requests
- role-based permission checks in the backend
- environment-variable based configuration for sensitive settings

### 3.4 Caching and Logging

I use caching for the public service list and the public open-slot list. Cache invalidation is triggered automatically after changes to services, slots, or booking status.

I use structured logging to record important application events such as:

- registration and login
- password reset activity
- booking creation
- booking status changes
- slot and service creation

Static files in the production-oriented path are served through WhiteNoise in the backend configuration, while Nginx is responsible for reverse proxy routing between frontend and backend services.

## 4. Testing and Deployment

### 4.1 Testing

The backend test suite verifies:

- registration and login
- password reset flow
- role-based access permissions
- booking creation and workflow rules
- slot visibility
- cache invalidation behavior

The frontend test suite verifies:

- guest-mode rendering
- visibility of staff management features after login

### 4.2 Deployment

The repository includes:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

This setup allows me to deploy the system as a local multi-container environment with frontend, backend, database, cache, and reverse proxy services. I also prepared separate environment configurations for local development and production-like containerized execution.

## 5. Conclusion

With BookEase, I demonstrate a complete business-oriented full-stack workflow with user roles, authentication, password reset, CRUD features, caching, logging, testing, and containerization. This application solves a realistic scheduling problem and gives me a strong basis for both technical presentation and future extension.

## 6. Future Work

- production email delivery for password reset
- broader frontend integration test coverage
- analytics dashboard for booking trends
- notifications and external calendar integrations

## 7. References

- Django documentation
- Django REST Framework documentation
- React documentation
- Docker documentation
- Nginx documentation
- Redis documentation
