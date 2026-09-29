import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string | null;
  image_url: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  ticket_price: number | null;
  ticket_currency: string | null;
  ticket_url: string | null;
  featured: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatPrice(
  price: number | null,
  currency: string | null
) {
  if (price === null) {
    return "Tickets available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      slug,
      description,
      event_type,
      image_url,
      event_date,
      start_time,
      end_time,
      venue,
      address,
      city,
      country,
      ticket_price,
      ticket_currency,
      ticket_url,
      featured
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("public_visible", true)
    .single();

  if (error || !event) {
    notFound();
  }

  const eventData = event as EventRow;

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">

      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em]"
          >
            CELEBRITY
            <span className="ml-1 text-black/40">
              MANAGEMENT
            </span>
          </Link>

          <Link
            href="/events"
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            ← All Events
          </Link>

        </div>
      </header>

      {/* EVENT */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">

        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-[2rem] bg-black">

          {eventData.image_url ? (
            <div className="relative aspect-[16/8] w-full">
              <Image
                src={eventData.image_url}
                alt={eventData.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10 lg:p-14">

                {eventData.event_type && (
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                    {eventData.event_type}
                  </p>
                )}

                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {eventData.title}
                </h1>

              </div>
            </div>
          ) : (
            <div className="flex aspect-[16/8] items-center justify-center">
              <p className="text-white/40">
                Event
              </p>
            </div>
          )}

        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">

          {/* DESCRIPTION */}
          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
              About the event
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Experience the event
            </h2>

            {eventData.description && (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-black/60">
                {eventData.description}
              </p>
            )}

            <div className="mt-10">
              <Link
                href="/booking"
                className="inline-flex rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Book a Celebrity
              </Link>
            </div>

          </div>

          {/* EVENT DETAILS */}
          <aside className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              Event Details
            </p>

            <div className="mt-6 space-y-6">

              {/* DATE */}
              <div>
                <p className="text-xs uppercase tracking-wider text-black/40">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(eventData.event_date)}
                </p>
              </div>

              {/* TIME */}
              {eventData.start_time && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {eventData.start_time.slice(0, 5)}
                    {eventData.end_time
                      ? ` – ${eventData.end_time.slice(0, 5)}`
                      : ""}
                  </p>
                </div>
              )}

              {/* VENUE */}
              {eventData.venue && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Venue
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {eventData.venue}
                  </p>
                </div>
              )}

              {/* LOCATION */}
              {(eventData.city || eventData.country) && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {eventData.city}
                    {eventData.country
                      ? `, ${eventData.country}`
                      : ""}
                  </p>
                </div>
              )}

              {/* ADDRESS */}
              {eventData.address && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {eventData.address}
                  </p>
                </div>
              )}

              {/* PRICE */}
              <div className="border-t border-black/10 pt-6">
                <p className="text-xs uppercase tracking-wider text-black/40">
                  Ticket Price
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {formatPrice(
                    eventData.ticket_price,
                    eventData.ticket_currency
                  )}
                </p>
              </div>

              {/* TICKET BUTTON */}
              {eventData.ticket_url ? (
                <a
                  href={eventData.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Get Tickets →
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Contact for Tickets →
                </Link>
              )}

            </div>

          </aside>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">

          <p>
            © 2026 Celebrity Management. All rights reserved.
          </p>

          <Link
            href="/events"
            className="font-medium text-black hover:underline"
          >
            View all events →
          </Link>

        </div>
      </footer>

    </main>
  );
}