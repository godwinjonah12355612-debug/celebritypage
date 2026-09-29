import Link from "next/link";
import Image from "next/image";
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
  capacity: number | null;
  ticket_price: number | null;
  ticket_currency: string | null;
  ticket_url: string | null;
  status: string;
  featured: boolean;
  public_visible: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
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

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
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
      capacity,
      ticket_price,
      ticket_currency,
      ticket_url,
      status,
      featured,
      public_visible
    `)
    .eq("status", "published")
    .eq("public_visible", true)
    .order("featured", {
      ascending: false,
    })
    .order("event_date", {
      ascending: true,
    });

  if (error) {
    console.error("Events loading error:", error);
  }

  const publicEvents = (events || []) as EventRow[];

  const featuredEvents = publicEvents.filter(
    (event) => event.featured
  );

  const regularEvents = publicEvents.filter(
    (event) => !event.featured
  );

  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            CELEBRITY MANAGEMENT
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/celebrities"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Celebrities
            </Link>

            <Link
              href="/events"
              className="text-sm font-medium"
            >
              Events
            </Link>

            <Link
              href="/booking"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Book a Celebrity
            </Link>

            <Link
              href="/member/login"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">

          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
              Events & Experiences
            </p>

            <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Experience the
              <br />
              moment.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              Discover upcoming appearances, live performances,
              exclusive fan experiences, and events featuring
              the celebrities we represent.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURED EVENTS */}
      {featuredEvents.length > 0 && (
        <section className="border-b border-black/10">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  Featured
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Featured Events
                </h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-black text-white"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-black/10">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-900">
                        <span className="text-sm text-white/40">
                          Event
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      {event.event_type && (
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                          {event.event_type}
                        </span>
                      )}

                      <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">
                        {event.title}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
                        <span>
                          {formatDate(event.event_date)}
                        </span>

                        {event.city && (
                          <span>
                            {event.city}
                            {event.country
                              ? `, ${event.country}`
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ALL EVENTS */}
      <section>
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              Calendar
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Upcoming Events
            </h2>
          </div>

          {publicEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 px-6 py-20 text-center">
              <h3 className="text-xl font-semibold">
                No upcoming events
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
                There are currently no public events available.
                Please check back soon for new announcements.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="relative aspect-[4/3] overflow-hidden bg-black/[0.03]">

                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-black/30">
                          Event
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="p-6">

                    {event.event_type && (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                        {event.event_type}
                      </p>
                    )}

                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      {event.title}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-black/55">

                      <p>
                        {formatDate(event.event_date)}
                      </p>

                      {event.start_time && (
                        <p>
                          {event.start_time.slice(0, 5)}
                          {event.end_time
                            ? ` – ${event.end_time.slice(0, 5)}`
                            : ""}
                        </p>
                      )}

                      {event.venue && (
                        <p>
                          {event.venue}
                        </p>
                      )}

                      {event.city && (
                        <p>
                          {event.city}
                          {event.country
                            ? `, ${event.country}`
                            : ""}
                        </p>
                      )}

                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">

                      <span className="text-sm font-medium">
                        {formatPrice(
                          event.ticket_price,
                          event.ticket_currency
                        )}
                      </span>

                      <span className="text-sm font-medium transition group-hover:translate-x-1">
                        View Event →
                      </span>

                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Work With Us
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Looking to book a celebrity for your event?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/55">
            Tell us about your event and our management team
            will help you with availability, requirements and
            booking arrangements.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Book a Celebrity
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-5 pb-10 text-white sm:px-8">

        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Celebrity Management.
              All rights reserved.
            </p>

            <div className="flex gap-6 text-sm text-white/40">
              <Link
                href="/about"
                className="hover:text-white"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="hover:text-white"
              >
                Contact
              </Link>

              <Link
                href="/member/login"
                className="hover:text-white"
              >
                Member Login
              </Link>
            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}