# BookEase Use Cases

## Customer Use Cases

### 1. Register an account

- actor: customer
- goal: create an account to access booking features
- result: authenticated customer session is created

### 2. Log in

- actor: customer, staff, admin
- goal: access role-specific features
- result: authenticated session is established

### 3. Recover password

- actor: customer, staff, admin
- goal: regain account access
- result: password is reset and account can be used again

### 4. Browse services

- actor: customer
- goal: see what business services are available
- result: active services are displayed

### 5. Create a booking

- actor: customer
- goal: reserve an available slot for a service
- result: booking is created in pending state and slot becomes unavailable

### 6. Cancel own booking

- actor: customer
- goal: release a previously requested slot
- result: booking becomes cancelled and slot reopens

## Staff Use Cases

### 7. Create availability slots

- actor: staff
- goal: publish free booking times
- result: new slots appear in the system

### 8. Review booking requests

- actor: staff
- goal: manage incoming bookings
- result: booking is confirmed or rejected

### 9. Create services

- actor: staff or admin
- goal: add new business offerings
- result: service becomes visible in the catalog

## Admin Use Cases

### 10. Manage platform content

- actor: admin
- goal: oversee users, services, bookings, and slots
- result: I can keep platform data accurate and controlled

### 11. Monitor system behavior

- actor: admin
- goal: review logs and runtime behavior
- result: I can trace operational events
