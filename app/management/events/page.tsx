"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

type Celebrity = {
  id: string;
  name: string;
  image_url: string | null;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string | null;
  celebrity_id: string | null;
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
  status: EventStatus;
  featured: boolean;
  public_visible: boolean;
  created_at: string;

  // Supabase returns the relationship as an array.
  celebrity: Celebrity[] | null;
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ManagementEventsPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        slug,
        description,
        event_type,
        celebrity_id,
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
        public_visible,
        created_at,
        celebrity:celebrities (
          id,
          name,
          image_url
        )
      `)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("EVENTS LOAD ERROR:", error);
      setMessage(error.message);
      setEvents([]);
      setLoading(false);
      return;
    }

    setEvents((data as unknown as EventRow[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const celebrityName =
        event.celebrity?.[0]?.name?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.city?.toLowerCase().includes(query) ||
        event.country?.toLowerCase().includes(query) ||
        celebrityName.includes(query);

      const matchesFilter =
        filter === "all" || event.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const stats = {
    total: events.length,
    published: events.filter(
      (event) => event.status === "published"
    ).length,
    drafts: events.filter(
      (event) => event.status === "draft"
    ).length,
    completed: events.filter(
      (event) => event.status === "completed"
    ).length,
    cancelled: events.filter(
      (event) => event.status === "cancelled"
    ).length,
  };

  async function updateEvent(
    id: string,
    updates: Partial<EventRow>
  ) {
    setMessage("");

    const { error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("EVENT UPDATE ERROR:", error);
      setMessage(error.message);
      return;
    }

    await loadEvents();
  }

  async function togglePublished(event: EventRow) {
    const shouldPublish = event.status !== "published";

    await updateEvent(event.id, {
      status: shouldPublish ? "published" : "draft",
      public_visible: shouldPublish,
    });
  }

  async function toggleFeatured(event: EventRow) {
    await updateEvent(event.id, {
      featured: !event.featured,
    });
  }

  async function deleteEvent(event: EventRow) {
    const confirmed = window.confirm(
      `Delete "${event.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(event.id);
    setMessage("");

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      console.error("EVENT DELETE ERROR:", error);
      setMessage(error.message);
      setDeletingId(null);
      return;
    }

    setEvents((current) =>
      current.filter((item) => item.id !== event.id)
    );

    setDeletingId(null);
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusClasses(status: EventStatus) {
    switch (status) {
      case "published":
        return "bg-black text-white";

      case "completed":
        return "bg-neutral-200 text-neutral-800";

      case "cancelled":
        return "border border-red-200 bg-red-50 text-red-700";

      case "draft":
      default:
        return "border border-neutral-200 bg-white text-neutral-700";
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Events
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Manage public events, appearances, ticket information,
              and celebrity-linked events.
            </p>
          </div>

          <Link
            href="/management/events/new"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            + Create Event
          </Link>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Events"
            value={stats.total}
          />

          <StatCard
            label="Published"
            value={stats.published}
          />

          <StatCard
            label="Drafts"
            value={stats.drafts}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
          />

          <StatCard
            label="Cancelled"
            value={stats.cancelled}
          />
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="w-full lg:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search events, venues, cities or celebrities..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    filter === item.value
                      ? "bg-black text-white"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {/* EVENT LIST */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">

          {/* LOADING */}
          {loading && (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />

              <p className="text-sm text-neutral-500">
                Loading events...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && filteredEvents.length === 0 && (
            <div className="p-12 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
                ◇
              </div>

              <h2 className="text-lg font-semibold">
                No events found
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {events.length === 0
                  ? "Create your first event to get started."
                  : "Try changing your search or filter."}
              </p>

              {events.length === 0 && (
                <Link
                  href="/management/events/new"
                  className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                  Create Event
                </Link>
              )}
            </div>
          )}

          {/* DESKTOP TABLE */}
          {!loading && filteredEvents.length > 0 && (
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">

                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-4">
                      Event
                    </th>

                    <th className="px-6 py-4">
                      Celebrity
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Location
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Featured
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => {
                    const celebrity =
                      event.celebrity?.[0] || null;

                    return (
                      <tr
                        key={event.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70"
                      >

                        {/* EVENT */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">

                            <div className="h-14 w-20 overflow-hidden rounded-lg bg-neutral-100">
                              {event.image_url ? (
                                <img
                                  src={event.image_url}
                                  alt={event.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                  Event
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {event.title}
                              </p>

                              {event.event_type && (
                                <p className="mt-1 text-xs text-neutral-500">
                                  {event.event_type}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* CELEBRITY */}
                        <td className="px-6 py-5">
                          {celebrity ? (
                            <div className="flex items-center gap-2">

                              <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-100">
                                {celebrity.image_url ? (
                                  <img
                                    src={celebrity.image_url}
                                    alt={celebrity.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px]">
                                    {celebrity.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>

                              <span className="text-sm">
                                {celebrity.name}
                              </span>

                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400">
                              Not linked
                            </span>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-medium">
                            {formatDate(event.event_date)}
                          </p>

                          {event.start_time && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {formatTime(event.start_time)}
                            </p>
                          )}
                        </td>

                        {/* LOCATION */}
                        <td className="px-6 py-5">
                          <p className="max-w-[180px] text-sm">
                            {event.venue || "—"}
                          </p>

                          {(event.city || event.country) && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {[event.city, event.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${statusClasses(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>
                        </td>

                        {/* FEATURED */}
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleFeatured(event)
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              event.featured
                                ? "bg-black text-white"
                                : "border border-neutral-200 text-neutral-500"
                            }`}
                          >
                            {event.featured ? "Yes" : "No"}
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/management/events/${event.id}`}
                              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold hover:border-black"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                togglePublished(event)
                              }
                              className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                            >
                              {event.status === "published"
                                ? "Unpublish"
                                : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(event)
                              }
                              disabled={
                                deletingId === event.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === event.id
                                ? "..."
                                : "Delete"}
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

          {/* MOBILE */}
          {!loading && filteredEvents.length > 0 && (
            <div className="divide-y divide-neutral-100 lg:hidden">
              {filteredEvents.map((event) => {
                const celebrity =
                  event.celebrity?.[0] || null;

                return (
                  <div
                    key={event.id}
                    className="p-5"
                  >

                    <div className="flex gap-4">

                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                            Event
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <h3 className="font-semibold">
                              {event.title}
                            </h3>

                            <p className="mt-1 text-xs text-neutral-500">
                              {celebrity?.name ||
                                "No celebrity linked"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClasses(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>

                        </div>

                        <div className="mt-3 space-y-1 text-xs text-neutral-500">

                          <p>
                            <span className="font-medium text-black">
                              Date:
                            </span>{" "}
                            {formatDate(event.event_date)}
                          </p>

                          <p>
                            <span className="font-medium text-black">
                              Venue:
                            </span>{" "}
                            {event.venue || "—"}
                          </p>

                          <p>
                            <span className="font-medium text-black">
                              Location:
                            </span>{" "}
                            {[event.city, event.country]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>

                        </div>
                      </div>
                    </div>

                    {/* MOBILE ACTIONS */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      <Link
                        href={`/management/events/${event.id}`}
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(event)
                        }
                        className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
                      >
                        {event.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFeatured(event)
                        }
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold"
                      >
                        {event.featured
                          ? "Remove Featured"
                          : "Make Featured"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteEvent(event)
                        }
                        disabled={
                          deletingId === event.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        {deletingId === event.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}