# BookEase Defense Q&A

## 1. Why did you choose this topic?

I chose BookEase because it solves a practical business problem and naturally supports the main project requirements: authentication, multiple roles, CRUD operations, security, testing, caching, and deployment.

## 2. Why did you use React and Django REST Framework?

React was used to build an interactive single-page frontend. Django REST Framework was used because it provides a reliable backend structure, strong authentication support, clean serializers, and good tools for building secure APIs quickly.

## 3. How is authentication implemented?

Authentication is implemented with Django sessions. The frontend communicates with the backend using session cookies and CSRF protection for state-changing requests.

## 4. How are user roles handled?

The custom `User` model stores a `role` field. Permissions are enforced in backend views so that customers, staff, and admins can only perform actions allowed for their role.

## 5. Why can only customers create bookings?

This reflects the business logic of the platform. Staff and admins manage services and availability, while customers are the ones who reserve appointments.

## 6. How is password security handled?

Passwords are hashed by Django using its built-in authentication system. Password validation is also applied during registration and reset flows.

## 7. How is password reset demonstrated without email?

In local `DEBUG` mode, the password reset request endpoint returns a preview token and UID. This allows the reset flow to be demonstrated during defense without requiring an email service. In production, that data would be delivered by email instead.

## 8. What security measures are included?

- hashed passwords
- CSRF protection
- role-based permission checks
- Django ORM usage instead of unsafe raw queries
- environment-variable based configuration

## 9. Where is caching used?

Caching is used for the public service list and public open-slot list. These are read-heavy endpoints, so caching reduces repeated work and improves response efficiency.

## 10. How is cache invalidation handled?

The cache is cleared automatically whenever a service changes, a slot changes, or a booking changes slot availability.

## 11. Why did you add logging?

Logging helps track important business actions such as login, password reset, booking creation, and booking status changes. This is useful for debugging, monitoring, and explaining production-oriented practices.

## 12. What testing is included?

The backend has automated tests for authentication, password reset, role permissions, booking rules, slot visibility, and cache invalidation. The frontend has tests for guest-mode rendering and staff workspace visibility.

## 13. Why did you include Docker, Nginx, PostgreSQL, and Redis?

These tools make the project closer to a real deployment setup. Docker simplifies reproducible execution, Nginx acts as a reverse proxy, PostgreSQL provides production-oriented persistence, and Redis supports caching.

## 14. What would you improve next?

- email-based production password reset
- more frontend integration tests
- analytics dashboard
- notifications and calendar integrations
