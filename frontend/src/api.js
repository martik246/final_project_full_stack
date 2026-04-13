const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function readCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...options.headers,
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      data?.message ||
      "Request failed.";

    throw new Error(detail);
  }

  return data;
}

export async function ensureCsrfCookie() {
  return request("/api/auth/csrf/");
}

export async function getCurrentUser() {
  return request("/api/auth/me/");
}

export async function login(payload) {
  await ensureCsrfCookie();

  return request("/api/auth/login/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function register(payload) {
  await ensureCsrfCookie();

  return request("/api/auth/register/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(payload) {
  await ensureCsrfCookie();

  return request("/api/auth/password-reset/request/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function confirmPasswordReset(payload) {
  await ensureCsrfCookie();

  return request("/api/auth/password-reset/confirm/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  await ensureCsrfCookie();

  return request("/api/auth/logout/", {
    method: "POST",
    headers: {
      "X-CSRFToken": readCookie("csrftoken"),
    },
  });
}

export async function getServices() {
  return request("/api/services/");
}

export async function getSlots() {
  return request("/api/slots/");
}

export async function getBookings() {
  return request("/api/bookings/");
}

export async function createBooking(payload) {
  await ensureCsrfCookie();

  return request("/api/bookings/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function updateBookingAction(bookingId, action) {
  await ensureCsrfCookie();

  return request(`/api/bookings/${bookingId}/${action}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": readCookie("csrftoken"),
    },
  });
}

export async function createService(payload) {
  await ensureCsrfCookie();

  return request("/api/services/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}

export async function createSlot(payload) {
  await ensureCsrfCookie();

  return request("/api/slots/", {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "X-CSRFToken": readCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  });
}
