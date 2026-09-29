"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string | null;
  image_url: string | null;
  event_date: string;
  start_time: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  ticket_price: number | null;
  ticket_currency: string | null;
  featured: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
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

export default function HomeEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient();

      const { data, error } = await supabase
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
          venue,
          city,
          country,
          ticket_price,
          ticket_currency,
          featured
        `)
        .eq("status", "published")
        .eq("public_visible", true)
        .order("featured", {
          ascending: false,
        })
        .order("event_date", {
          ascending: true,
        })
        .limit(3);

      if (error) {
  console.error("HOMEPAGE EVENTS ERROR:", error);
} else {
  console.log("HOMEPAGE EVENTS DATA:", data);
  setEvents((data ?? []) as EventRow[]);
}

setLoading(false);
    }

    loadEvents();
  }, []);

  if (loading) {
    return (
      <section className="border-t border-black/10 bg-[#f5f5f3]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-black/10" />

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-3xl bg-black/5"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

 if (events.length === 0) {
  return (
    <section className="border-t border-black/10 bg-[#f5f5f3]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="text-3xl font-semibold">
          Upcoming Events
        </h2>

        <p className="mt-3 text-black/50">
          No published events found.
        </p>
      </div>
    </section>
  );
}
  return (
    <section className="border-t border-black/10 bg-[#f5f5f3]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
              Events & Experiences
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Upcoming Events
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-black/50 sm:text-base">
              Discover upcoming appearances, performances and
              exclusive experiences featuring our celebrities.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex w-fit rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            View All Events →
          </Link>

        </div>

        {/* EVENTS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* IMAGE */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black/[0.03]">

                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-sm text-black/30">
                      Event
                    </span>
                  </div>
                )}

                {event.featured && (
                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    Featured
                  </div>
                )}

              </div>

              {/* CONTENT */}
              <div className="p-6">

                {event.event_type && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                    {event.event_type}
                  </p>
                )}

                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  {event.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-black/50">

                  <p>
                    {formatDate(event.event_date)}
                  </p>

                  {event.start_time && (
                    <p>
                      {event.start_time.slice(0, 5)}
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

                  <span className="text-sm font-medium transition-transform duration-300 group-hover:translate-x-1">
                    View Event →
                  </span>

                </div>

              </div>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}