"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: string;
  booking_reference: string | null;
  celebrity_id: string;
  event_type: string;
  appearance_type: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
  audience_size: number | null;
  budget: string | null;
  message: string | null;
  quote_amount: number | null;
  booking_status: string;
  payment_status: string;
  created_at: string;
};

type Celebrity = {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBookings() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(
          `/member/login?redirect=${encodeURIComponent(
            "/account/bookings"
          )}`
        );
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          celebrity_id,
          event_type,
          appearance_type,
          event_date,
          event_time,
          location,
          audience_size,
          budget,
          message,
          quote_amount,
          booking_status,
          payment_status,
          created_at
        `)
        .eq("member_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("MY BOOKINGS ERROR:", error);
        setErrorMessage("We could not load your bookings.");
        setLoading(false);
        return;
      }

      const bookingData = (data || []) as Booking[];

      setBookings(bookingData);

      /*
        Load the celebrities connected to these bookings.
      */
      const celebrityIds = [
        ...new Set(bookingData.map((booking) => booking.celebrity_id)),
      ];

      if (celebrityIds.length > 0) {
        const { data: celebrityData, error: celebrityError } =
          await supabase
            .from("celebrities")
            .select(`
              id,
              name,
              image_url,
              category
            `)
            .in("id", celebrityIds);

        if (!celebrityError) {
          setCelebrities((celebrityData || []) as Celebrity[]);
        }
      }

      setLoading(false);
    }

    loadBookings();
  }, [router]);

  function getCelebrity(celebrityId: string) {
    return celebrities.find(
      (celebrity) => celebrity.id === celebrityId
    );
  }

  function formatStatus(status: string) {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(date: string) {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatCurrency(amount: number | null) {
    if (amount === null || amount === undefined) {
      return "Not quoted";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";

      case "awaiting_payment":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "quote_sent":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "under_review":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "event_completed":
      case "closed":
        return "bg-black text-white border-black";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  function getPaymentClasses(status: string) {
    switch (status) {
      case "paid":
        return "text-green-700";

      case "partial":
        return "text-amber-700";

      case "refunded":
        return "text-blue-700";

      default:
        return "text-black/45";
    }
  }

  const activeBookings = bookings.filter(
    (booking) =>
      !["closed", "cancelled", "event_completed"].includes(
        booking.booking_status
      )
  );

  const completedBookings = bookings.filter((booking) =>
    ["closed", "event_completed"].includes(booking.booking_status)
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] text-black">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />

            <p className="text-sm text-black/50">
              Loading your bookings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/account"
            className="text-xl font-black tracking-tight"
          >
            CM<span className="text-black/40">.</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link
              href="/celebrities"
              className="transition hover:text-black/50"
            >
              Celebrities
            </Link>

            <Link
              href="/booking"
              className="transition hover:text-black/50"
            >
              Book a Celebrity
            </Link>

            <Link
              href="/fan-card/apply"
              className="transition hover:text-black/50"
            >
              Fan Card
            </Link>

            <Link
              href="/account"
              className="font-semibold"
            >
              Account
            </Link>
          </nav>

          <Link
            href="/account"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            My Account
          </Link>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <Link
            href="/account"
            className="text-sm font-medium text-black/45 transition hover:text-black"
          >
            ← Back to Account
          </Link>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              Member Area
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              My Bookings
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
              Track your celebrity booking requests, event details,
              quotes, payments, and booking status.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* ERROR */}
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Bookings"
            value={bookings.length}
          />

          <StatCard
            label="Active Requests"
            value={activeBookings.length}
          />

          <StatCard
            label="Completed"
            value={completedBookings.length}
          />
        </div>

        {/* EMPTY STATE */}
        {bookings.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-black/10 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
              +
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
              You have not submitted a celebrity booking request.
              When you make one, it will appear here.
            </p>

            <Link
              href="/booking"
              className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-black/80"
            >
              Book a Celebrity
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            {bookings.map((booking) => {
              const celebrity = getCelebrity(
                booking.celebrity_id
              );

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                >
                  {/* BOOKING TOP */}
                  <div className="border-b border-black/10 p-6 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-black/5">
                          {celebrity?.image_url ? (
                            <img
                              src={celebrity.image_url}
                              alt={celebrity.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-black">
                              CM
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
                            Booking
                          </p>

                          <h2 className="mt-1 text-xl font-bold">
                            {celebrity?.name ||
                              "Celebrity"}
                          </h2>

                          <p className="mt-1 text-sm text-black/45">
                            {booking.booking_reference ||
                              "Booking reference pending"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-bold ${getStatusClasses(
                          booking.booking_status
                        )}`}
                      >
                        {formatStatus(
                          booking.booking_status
                        )}
                      </span>
                    </div>
                  </div>

                  {/* BOOKING DETAILS */}
                  <div className="grid gap-8 p-6 sm:p-7 lg:grid-cols-3">
                    <DetailItem
                      label="Event Type"
                      value={booking.event_type}
                    />

                    <DetailItem
                      label="Event Date"
                      value={formatDate(
                        booking.event_date
                      )}
                    />

                    <DetailItem
                      label="Location"
                      value={booking.location}
                    />

                    <DetailItem
                      label="Appearance"
                      value={
                        booking.appearance_type ||
                        "Not specified"
                      }
                    />

                    <DetailItem
                      label="Event Time"
                      value={
                        formatTime(booking.event_time) ||
                        "Not specified"
                      }
                    />

                    <DetailItem
                      label="Audience"
                      value={
                        booking.audience_size
                          ? `${booking.audience_size.toLocaleString()} people`
                          : "Not specified"
                      }
                    />

                    <DetailItem
                      label="Budget"
                      value={
                        booking.budget ||
                        "Not specified"
                      }
                    />

                    <DetailItem
                      label="Quote"
                      value={formatCurrency(
                        booking.quote_amount
                      )}
                    />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
                        Payment
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold capitalize ${getPaymentClasses(
                          booking.payment_status
                        )}`}
                      >
                        {formatStatus(
                          booking.payment_status
                        )}
                      </p>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  {booking.message && (
                    <div className="border-t border-black/10 px-6 py-6 sm:px-7">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
                        Your Message
                      </p>

                      <p className="mt-3 max-w-4xl text-sm leading-7 text-black/65">
                        {booking.message}
                      </p>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="flex flex-col gap-4 border-t border-black/10 bg-[#fafaf8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-xs text-black/40">
                      Submitted{" "}
                      {new Date(
                        booking.created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/booking"
                        className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold transition hover:border-black/30"
                      >
                        New Booking
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © 2026 Celebrity Management. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/terms"
              className="hover:text-black"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-black"
            >
              Privacy
            </Link>

            <Link
              href="/contact"
              className="hover:text-black"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
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
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-black/80">
        {value}
      </p>
    </div>
  );
}