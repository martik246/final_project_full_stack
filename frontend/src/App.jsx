import React, { useEffect, useState } from "react";
import "./App.css";
import {
  confirmPasswordReset,
  createBooking,
  createService,
  createSlot,
  getBookings,
  getCurrentUser,
  getServices,
  getSlots,
  login,
  logout,
  register,
  requestPasswordReset,
  updateBookingAction,
} from "./api";

const initialLoginForm = {
  username: "",
  password: "",
};

const initialRegisterForm = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirm: "",
};

const initialResetRequestForm = {
  email: "",
};

const initialResetConfirmForm = {
  uid: "",
  token: "",
  new_password: "",
  new_password_confirm: "",
};

const initialServiceForm = {
  name: "",
  description: "",
  duration_minutes: "60",
  price: "49.99",
  is_active: true,
};

const initialSlotForm = {
  start_time: "",
  end_time: "",
};

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function App() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [resetRequestForm, setResetRequestForm] = useState(initialResetRequestForm);
  const [resetConfirmForm, setResetConfirmForm] = useState(initialResetConfirmForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [slotForm, setSlotForm] = useState(initialSlotForm);
  const [resetPreview, setResetPreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Loading my BookEase workspace...");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(true);

  async function loadData(activeUser) {
    const [serviceData, slotData] = await Promise.all([getServices(), getSlots()]);

    setServices(serviceData);
    setSlots(slotData);

    if (activeUser) {
      const bookingData = await getBookings();
      setBookings(bookingData);
    } else {
      setBookings([]);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        let authenticatedUser = null;

        try {
          authenticatedUser = await getCurrentUser();
        } catch {
          authenticatedUser = null;
        }

        if (!isMounted) {
          return;
        }

        setUser(authenticatedUser);
        await loadData(authenticatedUser);

        if (!isMounted) {
          return;
        }

        setStatusMessage(
          authenticatedUser
            ? `Signed in as ${authenticatedUser.username} (${authenticatedUser.role}).`
            : "Guest mode active. Sign in to create and manage bookings.",
        );
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsBusy(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshAfterAuth(nextUser) {
    setUser(nextUser);
    await loadData(nextUser);
    setSelectedServiceId("");
    setSelectedSlotId("");
    setBookingNotes("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Signing in...");

    try {
      const response = await login(loginForm);
      await refreshAfterAuth(response.user);
      setLoginForm(initialLoginForm);
      setStatusMessage(`Welcome back, ${response.user.username}.`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Creating your account...");

    try {
      const response = await register(registerForm);
      await refreshAfterAuth(response.user);
      setRegisterForm(initialRegisterForm);
      setStatusMessage(`Account created for ${response.user.username}.`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleResetRequestSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Preparing password reset...");

    try {
      const response = await requestPasswordReset(resetRequestForm);
      setResetPreview(response.debug_reset_preview || null);
      if (response.debug_reset_preview) {
        setResetConfirmForm((current) => ({
          ...current,
          uid: response.debug_reset_preview.uid,
          token: response.debug_reset_preview.token,
        }));
      }
      setStatusMessage(response.message);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleResetConfirmSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Resetting password...");

    try {
      const response = await confirmPasswordReset(resetConfirmForm);
      setResetConfirmForm(initialResetConfirmForm);
      setResetPreview(null);
      setStatusMessage(response.message);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    setStatusMessage("Signing out...");

    try {
      await logout();
      await refreshAfterAuth(null);
      setStatusMessage("Signed out. Guest mode active.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedServiceId || !selectedSlotId) {
      setErrorMessage("Choose both a service and an available time slot.");
      return;
    }

    setStatusMessage("Creating booking request...");

    try {
      await createBooking({
        service: Number(selectedServiceId),
        slot: Number(selectedSlotId),
        notes: bookingNotes,
      });

      await loadData(user);
      setSelectedSlotId("");
      setBookingNotes("");
      setStatusMessage("Booking request created successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleBookingAction(bookingId, action, message) {
    setErrorMessage("");
    setStatusMessage(message);

    try {
      await updateBookingAction(bookingId, action);
      await loadData(user);
      setStatusMessage("Booking status updated.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleServiceCreate(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Creating a new service...");

    try {
      await createService({
        ...serviceForm,
        duration_minutes: Number(serviceForm.duration_minutes),
        price: Number(serviceForm.price),
      });
      setServiceForm(initialServiceForm);
      await loadData(user);
      setStatusMessage("Service created successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSlotCreate(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Publishing a new availability slot...");

    try {
      await createSlot(slotForm);
      setSlotForm(initialSlotForm);
      await loadData(user);
      setStatusMessage("Availability slot created successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const activeService = services.find((service) => service.id === Number(selectedServiceId));
  const visibleSlots = slots.filter((slot) => !slot.is_booked);
  const canManageCatalog = user?.role === "staff" || user?.role === "admin";

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-topbar">
          <div>
            <p className="eyebrow">My BookEase Live Workspace</p>
            <h1>How I turned the project concept into a working booking platform.</h1>
          </div>

          <div className="hero-badge">
            {user ? `${user.username} | ${user.role}` : "Guest mode"}
          </div>
        </div>

        <p className="hero-copy">
          On this screen, I demonstrate the actual project flow: user authentication,
          password reset, service browsing, slot selection, booking creation, and booking
          management based on user roles.
        </p>

        <div className="hero-metrics">
          <article>
            <strong>{services.length}</strong>
            <span>services loaded</span>
          </article>
          <article>
            <strong>{slots.length}</strong>
            <span>slots visible</span>
          </article>
          <article>
            <strong>{bookings.length}</strong>
            <span>bookings in current view</span>
          </article>
        </div>
      </section>

      <section className="status-strip">
        <p>{statusMessage}</p>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      </section>

      <section className="workspace-grid">
        {!user ? (
          <section className="panel panel-wide">
            <div className="panel-heading">
              <p className="card-label">Authentication</p>
              <h2>Enter the platform</h2>
            </div>

            <div className="triple-grid">
              <form className="stack-form" onSubmit={handleLoginSubmit}>
                <h3>Login</h3>
                <label>
                  Username
                  <input
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    placeholder="customer_demo"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="strong-pass-123"
                  />
                </label>
                <button type="submit">Sign in</button>
              </form>

              <form className="stack-form" onSubmit={handleRegisterSubmit}>
                <h3>Register</h3>
                <label>
                  Username
                  <input
                    value={registerForm.username}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  First name
                  <input
                    value={registerForm.first_name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        first_name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={registerForm.last_name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    type="password"
                    value={registerForm.password_confirm}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password_confirm: event.target.value,
                      }))
                    }
                  />
                </label>
                <button type="submit">Create account</button>
              </form>

              <div className="stack-form reset-stack">
                <form className="stack-form" onSubmit={handleResetRequestSubmit}>
                  <h3>Password reset request</h3>
                  <label>
                    Account email
                    <input
                      type="email"
                      value={resetRequestForm.email}
                      onChange={(event) =>
                        setResetRequestForm({
                          email: event.target.value,
                        })
                      }
                      placeholder="customer@bookease.local"
                    />
                  </label>
                  <button type="submit">Generate reset token</button>
                </form>

                {resetPreview ? (
                  <article className="mini-card">
                    <span>Debug reset preview</span>
                    <strong>{resetPreview.username}</strong>
                    <p className="token-line">UID: {resetPreview.uid}</p>
                    <p className="token-line">Token: {resetPreview.token}</p>
                  </article>
                ) : null}

                <form className="stack-form" onSubmit={handleResetConfirmSubmit}>
                  <h3>Password reset confirm</h3>
                  <label>
                    UID
                    <input
                      value={resetConfirmForm.uid}
                      onChange={(event) =>
                        setResetConfirmForm((current) => ({
                          ...current,
                          uid: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Token
                    <input
                      value={resetConfirmForm.token}
                      onChange={(event) =>
                        setResetConfirmForm((current) => ({
                          ...current,
                          token: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      value={resetConfirmForm.new_password}
                      onChange={(event) =>
                        setResetConfirmForm((current) => ({
                          ...current,
                          new_password: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      value={resetConfirmForm.new_password_confirm}
                      onChange={(event) =>
                        setResetConfirmForm((current) => ({
                          ...current,
                          new_password_confirm: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <button type="submit">Reset password</button>
                </form>
              </div>
            </div>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-heading inline-heading">
              <div>
                <p className="card-label">Current user</p>
                <h2>{user.username}</h2>
              </div>
              <button className="secondary-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="profile-grid">
              <article className="mini-card">
                <span>Role</span>
                <strong>{user.role}</strong>
              </article>
              <article className="mini-card">
                <span>Email</span>
                <strong>{user.email || "Not provided"}</strong>
              </article>
              <article className="mini-card">
                <span>Access</span>
                <strong>
                  {user.role === "customer"
                    ? "Can create bookings"
                    : "Can manage services, slots, and booking workflow"}
                </strong>
              </article>
            </div>
          </section>
        )}

        <section className="panel">
          <div className="panel-heading">
            <p className="card-label">Catalog</p>
            <h2>Available services</h2>
          </div>

          <div className="service-list">
            {services.length === 0 ? (
              <p className="muted-text">No services yet. Staff or admin can create the first one below.</p>
            ) : (
              services.map((service) => (
                <article
                  key={service.id}
                  className={`service-card ${
                    Number(selectedServiceId) === service.id ? "service-card-active" : ""
                  }`}
                >
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-meta">
                    <span>{service.duration_minutes} min</span>
                    <strong>${service.price}</strong>
                  </div>
                  {user?.role === "customer" ? (
                    <button type="button" onClick={() => setSelectedServiceId(String(service.id))}>
                      {Number(selectedServiceId) === service.id ? "Selected" : "Choose service"}
                    </button>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <p className="card-label">Scheduling</p>
            <h2>{user?.role === "customer" ? "Book a time slot" : "Visible slots"}</h2>
          </div>

          {user?.role === "customer" ? (
            <form className="stack-form" onSubmit={handleBookingSubmit}>
              <label>
                Selected service
                <select
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                >
                  <option value="">Choose a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Available slot
                <select
                  value={selectedSlotId}
                  onChange={(event) => setSelectedSlotId(event.target.value)}
                >
                  <option value="">Choose a time slot</option>
                  {visibleSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.staff_member_username} | {formatDate(slot.start_time)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Booking notes
                <textarea
                  value={bookingNotes}
                  onChange={(event) => setBookingNotes(event.target.value)}
                  placeholder={
                    activeService
                      ? `Notes for ${activeService.name}`
                      : "Add optional notes for the booking"
                  }
                  rows="4"
                />
              </label>

              <button type="submit">Create booking request</button>
            </form>
          ) : (
            <div className="slot-list">
              {slots.length === 0 ? (
                <p className="muted-text">
                  No slots available yet. Staff and admin can create them in the management panel.
                </p>
              ) : (
                slots.map((slot) => (
                  <article key={slot.id} className="slot-card">
                    <div>
                      <h3>{slot.staff_member_username}</h3>
                      <p>{formatDate(slot.start_time)}</p>
                    </div>
                    <span className={`pill ${slot.is_booked ? "pill-booked" : "pill-open"}`}>
                      {slot.is_booked ? "Booked" : "Open"}
                    </span>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {canManageCatalog ? (
          <section className="panel panel-wide">
            <div className="panel-heading">
              <p className="card-label">Management</p>
              <h2>Staff and admin quick actions</h2>
            </div>

            <div className="auth-grid">
              <form className="stack-form" onSubmit={handleServiceCreate}>
                <h3>Create service</h3>
                <label>
                  Service name
                  <input
                    value={serviceForm.name}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    rows="4"
                    value={serviceForm.description}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Duration in minutes
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={serviceForm.duration_minutes}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        duration_minutes: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={serviceForm.is_active}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                  />
                  Service is active
                </label>
                <button type="submit">Create service</button>
              </form>

              <form className="stack-form" onSubmit={handleSlotCreate}>
                <h3>Create availability slot</h3>
                <label>
                  Start time
                  <input
                    type="datetime-local"
                    value={slotForm.start_time}
                    onChange={(event) =>
                      setSlotForm((current) => ({
                        ...current,
                        start_time: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  End time
                  <input
                    type="datetime-local"
                    value={slotForm.end_time}
                    onChange={(event) =>
                      setSlotForm((current) => ({
                        ...current,
                        end_time: event.target.value,
                      }))
                    }
                  />
                </label>
                <p className="muted-text">
                  Staff users automatically create slots under their own account. Admin users can
                  also create slots directly from this screen.
                </p>
                <button type="submit">Publish slot</button>
              </form>
            </div>
          </section>
        ) : null}

        <section className="panel panel-wide">
          <div className="panel-heading">
            <p className="card-label">Workflow</p>
            <h2>Bookings in current scope</h2>
          </div>

          {isBusy ? (
            <p className="muted-text">Loading interface...</p>
          ) : bookings.length === 0 ? (
            <p className="muted-text">
              {user
                ? "No bookings are visible for the current account yet."
                : "Login to see booking activity."}
            </p>
          ) : (
            <div className="booking-list">
              {bookings.map((booking) => (
                <article key={booking.id} className="booking-card">
                  <div className="booking-copy">
                    <h3>{booking.service_name}</h3>
                    <p>
                      Customer: <strong>{booking.customer_username}</strong>
                    </p>
                    <p>Status: {booking.status}</p>
                    <p>Updated: {formatDate(booking.updated_at)}</p>
                    {booking.notes ? <p>Notes: {booking.notes}</p> : null}
                  </div>

                  <div className="booking-actions">
                    <span className={`pill pill-${booking.status}`}>{booking.status}</span>

                    {user?.role === "customer" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleBookingAction(booking.id, "cancel", "Cancelling booking...")
                        }
                        disabled={booking.status === "cancelled"}
                      >
                        Cancel
                      </button>
                    ) : null}

                    {user?.role === "staff" || user?.role === "admin" ? (
                      <div className="action-row">
                        <button
                          type="button"
                          onClick={() =>
                            handleBookingAction(booking.id, "confirm", "Confirming booking...")
                          }
                          disabled={booking.status === "confirmed"}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleBookingAction(booking.id, "reject", "Rejecting booking...")
                          }
                          disabled={booking.status === "rejected"}
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
