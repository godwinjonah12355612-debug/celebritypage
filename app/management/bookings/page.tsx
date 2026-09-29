"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type BookingStatus =
  | "request"
  | "under_review"
  | "quote_sent"
  | "awaiting_payment"
  | "confirmed"
  | "event_completed"
  | "closed"
  | "cancelled";

type PaymentStatus =
  | "unpaid"
  | "pending"
  | "partial"
  | "paid"
  | "refunded";

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
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;

  member:
    | {
        full_name: string | null;
        display_name: string | null;
        email: string | null;
      }[]
    | null;

  celebrity:
    | {
        name: string;
        image_url: string | null;
        category: string | null;
      }[]
    | null;
};

const STATUS_OPTIONS: {
  value: "all" | BookingStatus;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "request", label: "Request" },
  { value: "under_review", label: "Under Review" },
  { value: "quote_sent", label: "Quote Sent" },
  {
    value: "awaiting_payment",
    label: "Awaiting Payment",
  },
  { value: "confirmed", label: "Confirmed" },
  {
    value: "event_completed",
    label: "Event Completed",
  },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatStatus(status: BookingStatus) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: BookingStatus) {
  switch (status) {
    case "request":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "quote_sent":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "awaiting_payment":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "confirmed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "event_completed":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "closed":
      return "border-gray-200 bg-gray-100 text-gray-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-100 text-gray-600";
  }
}

function paymentClasses(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "text-emerald-700";

    case "partial":
      return "text-orange-700";

    case "pending":
      return "text-blue-700";

    case "refunded":
      return "text-red-700";

    default:
      return "text-gray-500";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMemberName(booking: Booking) {
  const member = booking.member?.[0];

  return (
    member?.display_name ||
    member?.full_name ||
    member?.email?.split("@")[0] ||
    "Unknown Member"
  );
}

function getMemberEmail(booking: Booking) {
  return booking.member?.[0]?.email || "—";
}

function getCelebrity(booking: Booking) {
  return booking.celebrity?.[0];
}

export default function ManagementBookingsPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | BookingStatus
  >("all");

  const [paymentFilter, setPaymentFilter] = useState<
    "all" | PaymentStatus
  >("all");

  async function loadBookings(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
        updated_at,

        member:profiles!bookings_member_id_fkey(
          full_name,
          display_name,
          email
        ),

        celebrity:celebrities!bookings_celebrity_id_fkey(
          name,
          image_url,
          category
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("BOOKINGS ERROR:", error);
      setErrorMessage(error.message);
      setBookings([]);
    } else {
      setBookings((data || []) as Booking[]);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const celebrity = getCelebrity(booking);

      const matchesSearch =
        !query ||
        booking.booking_reference
          ?.toLowerCase()
          .includes(query) ||
        booking.event_type
          ?.toLowerCase()
          .includes(query) ||
        booking.location
          ?.toLowerCase()
          .includes(query) ||
        getMemberName(booking)
          .toLowerCase()
          .includes(query) ||
        getMemberEmail(booking)
          .toLowerCase()
          .includes(query) ||
        celebrity?.name
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        booking.booking_status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        booking.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    bookings,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const stats = useMemo(() => {
    const total = bookings.length;

    const requests = bookings.filter(
      (booking) =>
        booking.booking_status === "request"
    ).length;

    const review = bookings.filter(
      (booking) =>
        booking.booking_status ===
        "under_review"
    ).length;

    const confirmed = bookings.filter(
      (booking) =>
        booking.booking_status ===
        "confirmed"
    ).length;

    const awaitingPayment = bookings.filter(
      (booking) =>
        booking.booking_status ===
        "awaiting_payment"
    ).length;

    const completed = bookings.filter(
      (booking) =>
        booking.booking_status ===
        "event_completed"
    ).length;

    return {
      total,
      requests,
      review,
      confirmed,
      awaitingPayment,
      completed,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-black">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/management"
                className="text-sm font-medium text-gray-500 hover:text-black"
              >
                ← Management Dashboard
              </Link>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Operations
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Bookings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  Review celebrity booking requests,
                  manage quotes, monitor payments, and
                  track each booking through completion.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadBookings(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh bookings"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-semibold">
              Unable to load bookings
            </p>

            <p className="mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            label="Total"
            value={stats.total}
          />

          <StatCard
            label="Requests"
            value={stats.requests}
          />

          <StatCard
            label="Under Review"
            value={stats.review}
          />

          <StatCard
            label="Awaiting Payment"
            value={stats.awaitingPayment}
          />

          <StatCard
            label="Confirmed"
            value={stats.confirmed}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
          />
        </section>

        {/* FILTERS */}
        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Search
              </label>

              <div className="relative mt-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search booking, member, celebrity, location..."
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Booking status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | BookingStatus
                  )
                }
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Payment
              </label>

              <select
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(
                    e.target.value as
                      | "all"
                      | PaymentStatus
                  )
                }
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >
                <option value="all">
                  All payments
                </option>
                <option value="unpaid">
                  Unpaid
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="partial">
                  Partial
                </option>
                <option value="paid">
                  Paid
                </option>
                <option value="refunded">
                  Refunded
                </option>
              </select>
            </div>
          </div>

          {(search ||
            statusFilter !== "all" ||
            paymentFilter !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-black/5 pt-4">
              <span className="text-xs text-gray-500">
                {filteredBookings.length} result
                {filteredBookings.length !== 1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="text-xs font-semibold underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* CONTENT */}
        <section className="mt-6">
          {loading ? (
            <LoadingState />
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              hasBookings={bookings.length > 0}
              search={search}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-hidden rounded-3xl border border-black/10 bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px]">
                    <thead className="border-b border-black/10 bg-gray-50">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Booking
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Member
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Celebrity
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Event
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Status
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Payment
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Date
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredBookings.map(
                        (booking) => {
                          const celebrity =
                            getCelebrity(
                              booking
                            );

                          return (
                            <tr
                              key={booking.id}
                              className="border-b border-black/5 last:border-0 hover:bg-gray-50/70"
                            >
                              <td className="px-6 py-5">
                                <p className="font-mono text-xs font-semibold">
                                  {booking.booking_reference ||
                                    "Pending ID"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {formatDate(
                                    booking.created_at
                                  )}
                                </p>
                              </td>

                              <td className="px-6 py-5">
                                <p className="max-w-[170px] truncate text-sm font-semibold">
                                  {getMemberName(
                                    booking
                                  )}
                                </p>

                                <p className="mt-1 max-w-[170px] truncate text-xs text-gray-500">
                                  {getMemberEmail(
                                    booking
                                  )}
                                </p>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                    {celebrity?.image_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={
                                          celebrity.image_url
                                        }
                                        alt={
                                          celebrity.name
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-xs font-bold">
                                        {celebrity?.name
                                          ?.charAt(
                                            0
                                          ) || "C"}
                                      </div>
                                    )}
                                  </div>

                                  <p className="max-w-[150px] truncate text-sm font-semibold">
                                    {celebrity?.name ||
                                      "Unknown Celebrity"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <p className="max-w-[140px] truncate text-sm font-medium">
                                  {booking.event_type}
                                </p>

                                <p className="mt-1 max-w-[140px] truncate text-xs text-gray-500">
                                  {booking.location}
                                </p>
                              </td>

                              <td className="px-6 py-5">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold capitalize ${statusClasses(
                                    booking.booking_status
                                  )}`}
                                >
                                  {formatStatus(
                                    booking.booking_status
                                  )}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <p
                                  className={`text-xs font-semibold capitalize ${paymentClasses(
                                    booking.payment_status
                                  )}`}
                                >
                                  {booking.payment_status}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {formatCurrency(
                                    booking.quote_amount
                                  )}
                                </p>
                              </td>

                              <td className="px-6 py-5 text-sm text-gray-600">
                                {formatDate(
                                  booking.event_date
                                )}
                              </td>

                              <td className="px-6 py-5">
                                <Link
                                  href={`/management/bookings/${booking.id}`}
                                  className="inline-flex rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                                >
                                  Review
                                </Link>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE */}
              <div className="space-y-4 md:hidden">
                {filteredBookings.map(
                  (booking) => {
                    const celebrity =
                      getCelebrity(booking);

                    return (
                      <Link
                        key={booking.id}
                        href={`/management/bookings/${booking.id}`}
                        className="block rounded-3xl border border-black/10 bg-white p-5 transition hover:border-black/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs font-semibold">
                              {booking.booking_reference ||
                                "Pending ID"}
                            </p>

                            <p className="mt-2 text-base font-semibold">
                              {celebrity?.name ||
                                "Unknown Celebrity"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClasses(
                              booking.booking_status
                            )}`}
                          >
                            {formatStatus(
                              booking.booking_status
                            )}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-5">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Member
                            </p>

                            <p className="mt-1 truncate text-sm font-medium">
                              {getMemberName(
                                booking
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Event
                            </p>

                            <p className="mt-1 truncate text-sm font-medium">
                              {booking.event_type}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Event Date
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatDate(
                                booking.event_date
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                              Payment
                            </p>

                            <p
                              className={`mt-1 text-sm font-medium capitalize ${paymentClasses(
                                booking.payment_status
                              )}`}
                            >
                              {booking.payment_status}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                          <span className="text-xs text-gray-500">
                            {booking.location}
                          </span>

                          <span className="text-xs font-semibold">
                            Review →
                          </span>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
      <div className="hidden md:block">
        {Array.from({ length: 7 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-6 border-b border-black/5 px-6 py-6 last:border-0"
            >
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-6 w-24 rounded-full bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          )
        )}
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl bg-gray-100"
            />
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({
  hasBookings,
  search,
}: {
  hasBookings: boolean;
  search: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
        B
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        {hasBookings
          ? "No matching bookings"
          : "No bookings yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {hasBookings
          ? search
            ? "Try a different search term or clear your filters."
            : "There are no bookings matching the selected filters."
          : "New celebrity booking requests will appear here once members submit them."}
      </p>
    </div>
  );
}