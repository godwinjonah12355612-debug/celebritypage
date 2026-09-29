"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  location: string | null;
  management_status: "active" | "inactive" | "pending";
  verified: boolean;
  booking_available: boolean;
  featured: boolean;
};

const categories = [
  "All",
  "Actor",
  "Recording Artist",
  "Athlete",
  "Musician",
];

export default function ManagementCelebritiesPage() {
  const supabase = createClient();

  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  async function loadCelebrities() {
    setLoading(true);

    const { data, error } = await supabase
      .from("celebrities")
      .select(
        `
        id,
        name,
        slug,
        category,
        image_url,
        location,
        management_status,
        verified,
        booking_available,
        featured
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading celebrities:", error);
      setCelebrities([]);
    } else {
      setCelebrities(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCelebrities();
  }, []);

  const filteredCelebrities = celebrities.filter((celebrity) => {
    const matchesSearch =
      celebrity.name.toLowerCase().includes(search.toLowerCase()) ||
      celebrity.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || celebrity.category === category;

    const matchesStatus =
      status === "All" || celebrity.management_status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  async function toggleStatus(
    celebrity: Celebrity,
    newStatus: "active" | "inactive"
  ) {
    const { error } = await supabase
      .from("celebrities")
      .update({
        management_status: newStatus,
      })
      .eq("id", celebrity.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCelebrities();
  }

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-black">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/40">
              Management
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Celebrities
            </h1>
          </div>

          <Link
            href="/management"
            className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        {/* Top section */}
        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
              Talent Management
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Manage your talent
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
              Add, edit and manage celebrity profiles, availability,
              verification and booking status.
            </p>
          </div>

          <Link
            href="/management/celebrities/new"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
          >
            + Add Celebrity
          </Link>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Talent"
            value={celebrities.length}
          />

          <StatCard
            label="Active"
            value={
              celebrities.filter(
                (celebrity) => celebrity.management_status === "active"
              ).length
            }
          />

          <StatCard
            label="Featured"
            value={
              celebrities.filter((celebrity) => celebrity.featured).length
            }
          />

          <StatCard
            label="Verified"
            value={
              celebrities.filter((celebrity) => celebrity.verified).length
            }
          />
        </section>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 xl:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search celebrities..."
                className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </section>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
              {filteredCelebrities.length}{" "}
              {filteredCelebrities.length === 1
                ? "Celebrity"
                : "Celebrities"}
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredCelebrities.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCelebrities.map((celebrity) => (
                <CelebrityCard
                  key={celebrity.id}
                  celebrity={celebrity}
                  onToggleStatus={toggleStatus}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Stat Card
------------------------------------------------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Celebrity Card
------------------------------------------------------- */

function CelebrityCard({
  celebrity,
  onToggleStatus,
}: {
  celebrity: Celebrity;
  onToggleStatus: (
    celebrity: Celebrity,
    newStatus: "active" | "inactive"
  ) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      {/* Image */}
      <div className="relative h-72 overflow-hidden bg-black">
        {celebrity.image_url ? (
          <img
            src={celebrity.image_url}
            alt={celebrity.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#e9e9e5]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
              No Photo
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 flex gap-2">
          {celebrity.verified && (
            <span className="rounded-full bg-white px-3 py-1 text-[9px] font-semibold uppercase tracking-wider">
              Verified
            </span>
          )}

          {celebrity.featured && (
            <span className="rounded-full bg-black px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {celebrity.name}
            </h3>

            <p className="mt-1 text-xs text-black/45">
              {celebrity.category}
            </p>
          </div>

          <StatusBadge status={celebrity.management_status} />
        </div>

        <div className="mt-5 space-y-2 border-t border-black/10 pt-4">
          {celebrity.location && (
            <div className="flex justify-between text-xs">
              <span className="text-black/40">Location</span>
              <span className="font-medium">{celebrity.location}</span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-black/40">Booking</span>

            <span
              className={
                celebrity.booking_available
                  ? "font-medium text-green-700"
                  : "font-medium text-black/40"
              }
            >
              {celebrity.booking_available
                ? "Available"
                : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`/management/celebrities/${celebrity.id}`}
            className="rounded-xl border border-black/10 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
          >
            Edit
          </Link>

          {celebrity.management_status === "active" ? (
            <button
              type="button"
              onClick={() => onToggleStatus(celebrity, "inactive")}
              className="rounded-xl border border-black/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleStatus(celebrity, "active")}
              className="rounded-xl border border-black/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
            >
              Activate
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   Status Badge
------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: Celebrity["management_status"];
}) {
  const styles = {
    active: "bg-green-50 text-green-700",
    inactive: "bg-black/5 text-black/45",
    pending: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* -------------------------------------------------------
   Loading
------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[520px] animate-pulse rounded-2xl border border-black/10 bg-white"
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   Empty
------------------------------------------------------- */

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
      <p className="text-lg font-semibold">No celebrities found</p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
        {search
          ? `No talent matches "${search}". Try another search.`
          : "There are currently no celebrity records in the system."}
      </p>

      {!search && (
        <Link
          href="/management/celebrities/new"
          className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
        >
          Add First Celebrity
        </Link>
      )}
    </div>
  );
}