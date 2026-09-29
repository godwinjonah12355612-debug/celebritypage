"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

export default function CelebritiesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadCelebrities() {
      setLoading(true);

      const { data, error } = await supabase
        .from("celebrities")
        .select(`
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
        `)
        .eq("management_status", "active")
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

      if (error) {
        console.error("PUBLIC CELEBRITIES ERROR:", error);
        setCelebrities([]);
        setLoading(false);
        return;
      }

      setCelebrities(data ?? []);
      setLoading(false);
    }

    loadCelebrities();
  }, [supabase]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(celebrities.map((celebrity) => celebrity.category))
    );

    return ["All", ...uniqueCategories];
  }, [celebrities]);

  const filteredCelebrities = celebrities.filter((celebrity) => {
    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      celebrity.name.toLowerCase().includes(searchTerm) ||
      celebrity.category.toLowerCase().includes(searchTerm) ||
      (celebrity.location ?? "").toLowerCase().includes(searchTerm);

    const matchesCategory =
      activeCategory === "All" ||
      celebrity.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
  };

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#151515]">
      {/* =========================================================
          NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold tracking-wider text-white">
              CM
            </div>

            <div className="leading-none">
              <p className="text-sm font-bold tracking-[0.18em]">
                CELEBRITY
              </p>

              <p className="mt-1 text-[9px] font-medium tracking-[0.3em] text-black/45">
                MANAGEMENT
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/celebrities"
              className="text-sm font-medium text-black"
            >
              Talent
            </Link>

            <Link
              href="/#fan-cards"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Fan Cards
            </Link>

            <Link
              href="/#bookings"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Bookings
            </Link>

            <Link
              href="/about"
              className="text-sm text-black/60 transition hover:text-black"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/member/login"
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/member/register"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Our Talent
          </p>

          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Meet our celebrities.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-black/50">
                Explore the artists, actors, athletes, and musicians
                represented through Celebrity Management.
              </p>
            </div>

            {/* Talent Count */}
            <div className="w-fit rounded-2xl border border-black/10 bg-[#f6f6f3] px-6 py-5">
              <p className="text-3xl font-semibold tracking-tight">
                {loading ? "—" : celebrities.length}
              </p>

              <p className="mt-1 text-xs text-black/45">
                Professional talent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DIRECTORY
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search celebrities by name or category..."
              className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 pr-14 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
            />

            <div className="pointer-events-none absolute right-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 text-sm text-black/50">
              ⌕
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black/60 hover:border-black/30 hover:text-black"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Results Information */}
        <div className="mb-8 flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-black/45">
            Showing{" "}
            <span className="font-semibold text-black">
              {loading ? "—" : filteredCelebrities.length}
            </span>{" "}
            {filteredCelebrities.length === 1
              ? "celebrity"
              : "celebrities"}
          </p>

          {(search || activeCategory !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit text-sm font-medium text-black underline underline-offset-4 transition hover:text-black/50"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =========================================================
            LOADING
        ========================================================= */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white"
              >
                <div className="h-80 animate-pulse bg-black/10" />

                <div className="space-y-3 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-black/10" />

                  <div className="h-7 w-40 animate-pulse rounded bg-black/10" />

                  <div className="h-4 w-24 animate-pulse rounded bg-black/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            CELEBRITY GRID
        ========================================================= */}
        {!loading && filteredCelebrities.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCelebrities.map((celebrity) => (
              <Link
                key={celebrity.id}
                href={`/celebrities/${celebrity.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-80 overflow-hidden bg-black">
                  {celebrity.image_url ? (
                    <Image
                      src={celebrity.image_url}
                      alt={celebrity.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      No Photo
                    </div>
                  )}

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                  {/* Verified */}
                  {celebrity.verified && (
                    <div className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold tracking-wider text-black/60 backdrop-blur">
                      VERIFIED
                    </div>
                  )}

                  {/* Featured */}
                  {celebrity.featured && (
                    <div className="absolute left-5 top-5 rounded-full bg-black/80 px-3 py-1 text-[9px] font-semibold tracking-wider text-white backdrop-blur">
                      FEATURED
                    </div>
                  )}

                  {/* Celebrity Information */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      {celebrity.category}
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                      {celebrity.name}
                    </h2>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between p-6">
                  <div>
                    <span className="text-sm font-medium text-black/45 transition group-hover:text-black">
                      View profile
                    </span>

                    {celebrity.location && (
                      <p className="mt-1 text-xs text-black/35">
                        {celebrity.location}
                      </p>
                    )}
                  </div>

                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* =========================================================
            EMPTY STATE
        ========================================================= */}
        {!loading && filteredCelebrities.length === 0 && (
          <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/5 text-xl">
              ⌕
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              No celebrities found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
              We couldn't find any celebrities matching your search or
              selected category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-7 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================
          BOOKING CTA
      ========================================================= */}
      <section className="border-t border-black/10 bg-[#151515] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
            Work With Our Talent
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Looking to book a celebrity?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/50">
            Tell us about your project and our management team will help
            connect you with the right talent.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Start a Booking Request
          </Link>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-black/10 bg-[#f6f6f3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.18em]">
              CELEBRITY MANAGEMENT
            </p>

            <p className="mt-2 text-xs text-black/40">
              Talent. Access. Opportunity.
            </p>
          </div>

          <p className="text-xs text-black/35">
            © {new Date().getFullYear()} Celebrity Management. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}