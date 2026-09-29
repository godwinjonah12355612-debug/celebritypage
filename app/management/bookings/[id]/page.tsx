"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: string;
  booking_reference: string | null;
  member_id: string | null;
  celebrity_id: string;
  event_type: string;
  appearance_type: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
  audience_size: number | null;
  budget: string | null;
  message: string | null;
  management_notes: string | null;
  quote_amount: number | null;
  booking_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
};

type Member = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
};

type Celebrity = {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  location: string | null;
  verified: boolean;
  booking_available: boolean;
};

const BOOKING_STATUSES = [
  "request",
  "under_review",
  "quote_sent",
  "awaiting_payment",
  "confirmed",
  "event_completed",
  "closed",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "partial",
  "paid",
  "refunded",
];

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "event_completed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "closed":
      return "bg-gray-100 text-gray-700 border-gray-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    case "awaiting_payment":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "quote_sent":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "under_review":
      return "bg-orange-50 text-orange-700 border-orange-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function paymentClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "partial":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "pending":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "refunded":
      return "bg-purple-50 text-purple-700 border-purple-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getMemberName(member: Member | null) {
  if (!member) return "Guest / Unknown Member";

  return (
    member.display_name ||
    member.full_name ||
    member.email?.split("@")[0] ||
    "Unknown Member"
  );
}

export default function BookingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const bookingId = String(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);

  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [managementNotes, setManagementNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          member_id,
          celebrity_id,
          event_type,
          appearance_type,
          event_date,
          event_time,
          location,
          audience_size,
          budget,
          message,
          management_notes,
          quote_amount,
          booking_status,
          payment_status,
          created_at,
          updated_at
        `)
        .eq("id", bookingId)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Booking not found.");
        setLoading(false);
        return;
      }

      const bookingData = data as Booking;

      setBooking(bookingData);
      setBookingStatus(bookingData.booking_status);
      setPaymentStatus(bookingData.payment_status);
      setQuoteAmount(
        bookingData.quote_amount !== null
          ? String(bookingData.quote_amount)
          : ""
      );
      setManagementNotes(bookingData.management_notes || "");

      if (bookingData.member_id) {
        const { data: memberData } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            display_name,
            email,
            phone,
            country
          `)
          .eq("id", bookingData.member_id)
          .maybeSingle();

        setMember((memberData as Member | null) || null);
      }

      const { data: celebrityData } = await supabase
        .from("celebrities")
        .select(`
          id,
          name,
          category,
          image_url,
          location,
          verified,
          booking_available
        `)
        .eq("id", bookingData.celebrity_id)
        .maybeSingle();

      setCelebrity((celebrityData as Celebrity | null) || null);

      setLoading(false);
    }

    loadBooking();
  }, [bookingId]);

  async function saveChanges() {
    if (!booking) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const numericQuote =
      quoteAmount.trim() === "" ? null : Number(quoteAmount);

    if (
      quoteAmount.trim() !== "" &&
      (Number.isNaN(numericQuote) || numericQuote! < 0)
    ) {
      setErrorMessage("Please enter a valid quote amount.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        booking_status: bookingStatus,
        payment_status: paymentStatus,
        quote_amount: numericQuote,
        management_notes: managementNotes.trim() || null,
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setBooking(data as Booking);
    setSuccessMessage("Booking updated successfully.");
    setSaving(false);
  }

  async function updateStatus(status: string) {
    if (!booking) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("bookings")
      .update({
        booking_status: status,
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    const updatedBooking = data as Booking;

    setBooking(updatedBooking);
    setBookingStatus(updatedBooking.booking_status);
    setSuccessMessage(`Booking moved to ${formatStatus(status)}.`);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f2] p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-32 rounded-3xl bg-white" />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-3xl bg-white lg:col-span-2" />
            <div className="h-80 rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f5f5f2] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-black">
            Booking not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {errorMessage || "This booking could not be loaded."}
          </p>

          <Link
            href="/management/bookings"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/management/bookings"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
            >
              ← Back to Bookings
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Booking Review
              </h1>

              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold">
                {booking.booking_reference || "No Reference"}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Review and manage this celebrity booking request.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                bookingStatus
              )}`}
            >
              {formatStatus(bookingStatus)}
            </span>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${paymentClasses(
                paymentStatus
              )}`}
            >
              Payment: {formatStatus(paymentStatus)}
            </span>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Celebrity */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Talent
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Celebrity Requested
                  </h2>
                </div>

                {celebrity?.booking_available && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Booking Available
                  </span>
                )}
              </div>

              {celebrity ? (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                    {celebrity.image_url ? (
                      <img
                        src={celebrity.image_url}
                        alt={celebrity.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                        {celebrity.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-semibold">
                        {celebrity.name}
                      </h3>

                      {celebrity.verified && (
                        <span className="rounded-full bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {celebrity.category}
                    </p>

                    {celebrity.location && (
                      <p className="mt-2 text-sm text-gray-500">
                        {celebrity.location}
                      </p>
                    )}

                    <Link
                      href={`/management/celebrities/${celebrity.id}`}
                      className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4"
                    >
                      View Celebrity Profile →
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Celebrity information unavailable.
                </p>
              )}
            </section>

            {/* Event details */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Event
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Event Details
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Event Type"
                  value={booking.event_type}
                />

                <InfoItem
                  label="Appearance Type"
                  value={booking.appearance_type || "Not specified"}
                />

                <InfoItem
                  label="Event Date"
                  value={formatDate(booking.event_date)}
                />

                <InfoItem
                  label="Event Time"
                  value={booking.event_time || "Not specified"}
                />

                <InfoItem
                  label="Location"
                  value={booking.location}
                />

                <InfoItem
                  label="Audience Size"
                  value={
                    booking.audience_size
                      ? booking.audience_size.toLocaleString()
                      : "Not specified"
                  }
                />

                <InfoItem
                  label="Client Budget"
                  value={booking.budget || "Not specified"}
                />

                <InfoItem
                  label="Booking Created"
                  value={formatDateTime(booking.created_at)}
                />
              </div>
            </section>

            {/* Message */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Client Request
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Booking Message
              </h2>

              <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {booking.message || "No message was provided."}
                </p>
              </div>
            </section>

            {/* Management notes */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Internal
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Management Notes
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                These notes are for the management team and are not part of the
                public booking request.
              </p>

              <textarea
                value={managementNotes}
                onChange={(e) => setManagementNotes(e.target.value)}
                rows={6}
                placeholder="Add internal notes about this booking..."
                className="mt-5 w-full rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Member */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Client
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Member Information
              </h2>

              <div className="mt-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
                  {getMemberName(member).charAt(0).toUpperCase()}
                </div>

                <h3 className="mt-4 font-semibold">
                  {getMemberName(member)}
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <InfoItem
                    label="Email"
                    value={member?.email || "—"}
                  />

                  <InfoItem
                    label="Phone"
                    value={member?.phone || "—"}
                  />

                  <InfoItem
                    label="Country"
                    value={member?.country || "—"}
                  />
                </div>

                {member && (
                  <Link
                    href={`/management/members/${member.id}`}
                    className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4"
                  >
                    View Member Profile →
                  </Link>
                )}
              </div>
            </section>

            {/* Booking controls */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Management
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Booking Controls
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Booking Status
                  </label>

                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Payment Status
                  </label>

                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Quote Amount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-sm outline-none focus:border-black"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={saving}
                  className="w-full rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Quick Actions
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Move Booking
              </h2>

              <div className="mt-5 space-y-2">
                {bookingStatus === "request" && (
                  <QuickAction
                    label="Start Review"
                    onClick={() => updateStatus("under_review")}
                    disabled={saving}
                  />
                )}

                {bookingStatus === "under_review" && (
                  <QuickAction
                    label="Send Quote"
                    onClick={() => updateStatus("quote_sent")}
                    disabled={saving}
                  />
                )}

                {bookingStatus === "quote_sent" && (
                  <QuickAction
                    label="Await Payment"
                    onClick={() => updateStatus("awaiting_payment")}
                    disabled={saving}
                  />
                )}

                {bookingStatus === "awaiting_payment" && (
                  <QuickAction
                    label="Confirm Booking"
                    onClick={() => updateStatus("confirmed")}
                    disabled={saving}
                  />
                )}

                {bookingStatus === "confirmed" && (
                  <QuickAction
                    label="Mark Event Completed"
                    onClick={() => updateStatus("event_completed")}
                    disabled={saving}
                  />
                )}

                {bookingStatus === "event_completed" && (
                  <QuickAction
                    label="Close Booking"
                    onClick={() => updateStatus("closed")}
                    disabled={saving}
                  />
                )}

                {!["closed", "cancelled"].includes(bookingStatus) && (
                  <button
                    type="button"
                    onClick={() => updateStatus("cancelled")}
                    disabled={saving}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Timeline
              </h2>

              <div className="mt-6 space-y-5">
                <TimelineItem
                  title="Booking Created"
                  value={formatDateTime(booking.created_at)}
                />

                <TimelineItem
                  title="Last Updated"
                  value={formatDateTime(booking.updated_at)}
                />

                <TimelineItem
                  title="Current Status"
                  value={formatStatus(booking.booking_status)}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/management/bookings"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold transition hover:border-black"
          >
            ← Back to Bookings
          </Link>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-black px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {disabled ? "Updating..." : label}
    </button>
  );
}

function TimelineItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="relative border-l border-gray-200 pl-5">
      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-black" />

      <p className="text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-gray-500">{value}</p>
    </div>
  );
}