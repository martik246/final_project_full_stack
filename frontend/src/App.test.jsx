import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import App from "./App";

vi.mock("./api", () => ({
  confirmPasswordReset: vi.fn(),
  createBooking: vi.fn(),
  createService: vi.fn(),
  createSlot: vi.fn(),
  getBookings: vi.fn(),
  getCurrentUser: vi.fn(),
  getServices: vi.fn(),
  getSlots: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  requestPasswordReset: vi.fn(),
  updateBookingAction: vi.fn(),
}));

import {
  getBookings,
  getCurrentUser,
  getServices,
  getSlots,
  login,
} from "./api";

describe("BookEase App", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentUser.mockRejectedValue(new Error("No active session"));
    getServices.mockResolvedValue([
      {
        id: 1,
        name: "Business Consultation",
        description: "Planning session",
        duration_minutes: 60,
        price: "59.99",
        is_active: true,
      },
    ]);
    getSlots.mockResolvedValue([
      {
        id: 1,
        staff_member_username: "staff_demo",
        start_time: "2026-04-15T10:00:00+05:00",
        end_time: "2026-04-15T11:00:00+05:00",
        is_booked: false,
      },
    ]);
    getBookings.mockResolvedValue([]);
  });

  test("renders guest authentication workspace", async () => {
    render(<App />);

    expect(await screen.findByText("Enter the platform")).toBeInTheDocument();
    expect(screen.getByText("Password reset request")).toBeInTheDocument();
    expect(screen.getByText("Available services")).toBeInTheDocument();
    expect(screen.getByText("Guest mode")).toBeInTheDocument();
  });

  test("shows management area after staff login", async () => {
    login.mockResolvedValue({
      user: {
        id: 2,
        username: "staff_demo",
        email: "staff@bookease.local",
        role: "staff",
      },
    });

    render(<App />);

    await screen.findByText("Enter the platform");

    fireEvent.change(screen.getByPlaceholderText("customer_demo"), {
      target: { value: "staff_demo" },
    });
    fireEvent.change(screen.getByPlaceholderText("strong-pass-123"), {
      target: { value: "strong-pass-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Staff and admin quick actions")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Create service" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create availability slot" })).toBeInTheDocument();
    expect(screen.getByText("staff_demo | staff")).toBeInTheDocument();
  });
});
