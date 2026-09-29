"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeEvents from "@/components/home-events";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  biography: string | null;
  location: string | null;
  management_status: "active" | "inactive" | "pending";
  verified: boolean;
  booking_available: boolean;
  featured: boolean;
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loadingCelebrities, setLoadingCelebrities] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadCelebrities() {
      setLoadingCelebrities(true);

      try {
        const { data, error } = await supabase
          .from("celebrities")
          .select(`
            id,
            name,
            slug,
            category,
            image_url,
            biography,
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
          console.error("HOMEPAGE CELEBRITIES ERROR:", error);
          setCelebrities([]);
          return;
        }

        setCelebrities(data ?? []);
      } catch (error) {
        console.error("HOMEPAGE CELEBRITIES LOAD FAILED:", error);
        setCelebrities([]);
      } finally {
        setLoadingCelebrities(false);
      }
    }

    loadCelebrities();
  }, [supabase]);

  const heroCelebrity = celebrities[0] ?? null;
  const homepageCelebrities = celebrities.slice(0, 6);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f6f3] text-[#151515]">
      {/* =========================
          NAVIGATION
      ========================== */}
      <header className="sticky top-0 z-[100] border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-xs font-bold tracking-wider text-white">
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

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="#talent"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Talent
            </Link>

            <Link
              href="#fan-cards"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Fan Cards
            </Link>

            <Link
              href="#bookings"
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

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/member/login"
              className="rounded-full px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
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

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="relative z-[110] flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm lg:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">
              {mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            </span>

            <span className="flex w-5 flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-200 ${
                  mobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 rounded-full bg-black transition-opacity duration-200 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              <span
                className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-200 ${
                  mobileMenuOpen
                    ? "-translate-y-2 -rotate-45"
                    : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="relative z-[105] border-t border-black/10 bg-[#f6f6f3] shadow-lg lg:hidden"
          >
            <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
              <div className="flex flex-col">
                <Link
                  href="#talent"
                  onClick={closeMobileMenu}
                  className="border-b border-black/10 py-4 text-base font-medium text-black"
                >
                  Talent
                </Link>

                <Link
                  href="#fan-cards"
                  onClick={closeMobileMenu}
                  className="border-b border-black/10 py-4 text-base font-medium text-black"
                >
                  Fan Cards
                </Link>

                <Link
                  href="#bookings"
                  onClick={closeMobileMenu}
                  className="border-b border-black/10 py-4 text-base font-medium text-black"
                >
                  Bookings
                </Link>

                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="border-b border-black/10 py-4 text-base font-medium text-black"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="border-b border-black/10 py-4 text-base font-medium text-black"
                >
                  Contact
                </Link>
              </div>

              {/* MOBILE ACTIONS */}
              <div className="mt-5 flex flex-col gap-3 pb-2">
                <Link
                  href="/member/login"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center justify-center rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium text-black"
                >
                  Sign In
                </Link>

                <Link
                  href="/member/register"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                  Join Now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =========================
          HERO
      ========================== */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          {/* HERO COPY */}
          <div className="min-w-0">
            <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

              <span className="text-xs font-medium text-black/60">
                Professional Talent Management
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Connecting
              <br />
              <span className="text-black/40">talent</span> with
              <br />
              opportunity.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-black/55 sm:text-lg">
              A modern platform for celebrity management, bookings,
              memberships, fan cards, events, and professional opportunities.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/celebrities"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black/80"
              >
                Explore Talent
              </Link>

              <Link
                href="/member/register"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-black/5"
              >
                Become a Member
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-14 grid max-w-lg grid-cols-3 border-t border-black/10 pt-7">
              <div className="min-w-0">
                <p className="text-2xl font-semibold tracking-tight">
                  {loadingCelebrities ? "—" : `${celebrities.length}+`}
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Celebrities
                </p>
              </div>

              <div className="min-w-0 border-l border-black/10 pl-4 sm:pl-5">
                <p className="text-2xl font-semibold tracking-tight">
                  1K+
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Members
                </p>
              </div>

              <div className="min-w-0 border-l border-black/10 pl-4 sm:pl-5">
                <p className="text-2xl font-semibold tracking-tight">
                  24/7
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Support
                </p>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative min-w-0">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

            <div className="relative rounded-[2rem] bg-[#151515] p-3 shadow-2xl">
              <div className="relative min-h-[500px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent p-6 sm:min-h-[520px] sm:p-7">
                <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10" />

                <div className="absolute bottom-20 right-20 h-2 w-2 rounded-full bg-white/50" />

                <div className="absolute bottom-32 right-10 h-1 w-1 rounded-full bg-white/30" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-medium tracking-[0.3em] text-white/40">
                      CELEBRITY MANAGEMENT
                    </p>

                    <p className="mt-2 text-xs font-semibold tracking-wider text-white/70">
                      FEATURED TALENT
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[9px] tracking-wider text-white/45">
                    {heroCelebrity?.verified ? "VERIFIED" : "TALENT"}
                  </span>
                </div>

                {/* DYNAMIC FEATURED CELEBRITY */}
                {loadingCelebrities ? (
                  <div className="absolute bottom-8 left-6 right-6 sm:left-7 sm:right-7">
                    <div className="mb-5 h-20 w-20 animate-pulse rounded-3xl bg-white/10" />

                    <div className="h-3 w-28 animate-pulse rounded bg-white/10" />

                    <div className="mt-3 h-10 w-56 max-w-full animate-pulse rounded bg-white/10" />
                  </div>
                ) : heroCelebrity ? (
                  <div className="absolute bottom-8 left-6 right-6 sm:left-7 sm:right-7">
                    <div className="relative mb-5 h-20 w-20 overflow-hidden rounded-3xl bg-white shadow-xl">
                      {heroCelebrity.image_url ? (
                        <Image
                          src={heroCelebrity.image_url}
                          alt={heroCelebrity.name}
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-black">
                          {heroCelebrity.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      {heroCelebrity.category}
                    </p>

                    <h2 className="mt-2 break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {heroCelebrity.name}
                    </h2>

                    <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-white/35">
                          Representation
                        </p>

                        <p className="mt-1 text-xs text-white/65">
                          Celebrity Management
                        </p>
                      </div>

                      <span className="shrink-0 text-2xl text-white/20">
                        ✦
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-8 left-6 right-6 sm:left-7 sm:right-7">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-xl font-bold text-black shadow-xl">
                      CM
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Featured Talent
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      Coming Soon
                    </h2>

                    <div className="mt-7 border-t border-white/10 pt-5">
                      <p className="text-xs text-white/50">
                        Our featured talent will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TALENT
      ========================== */}
      <section
        id="talent"
        className="scroll-mt-24 border-t border-black/10 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                Our Talent
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Meet the celebrities
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-black/45">
                Discover artists, actors, athletes, musicians, and other
                exceptional talent represented through our platform.
              </p>
            </div>

            <Link
              href="/celebrities"
              className="w-fit shrink-0 text-sm font-semibold underline underline-offset-4"
            >
              View all talent →
            </Link>
          </div>

          {/* LOADING */}
          {loadingCelebrities && (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#f6f6f3]"
                >
                  <div className="h-72 animate-pulse bg-black/10" />

                  <div className="space-y-3 p-6">
                    <div className="h-3 w-24 animate-pulse rounded bg-black/10" />

                    <div className="h-6 w-40 animate-pulse rounded bg-black/10" />

                    <div className="h-4 w-24 animate-pulse rounded bg-black/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loadingCelebrities && homepageCelebrities.length === 0 && (
            <div className="mt-12 rounded-[1.5rem] border border-black/10 bg-[#f6f6f3] px-6 py-20 text-center">
              <p className="text-xl font-semibold">
                Talent coming soon.
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                Our management team is currently preparing our celebrity
                roster.
              </p>

              <Link
                href="/contact"
                className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                Contact Management
              </Link>
            </div>
          )}

          {/* CELEBRITY GRID */}
          {!loadingCelebrities && homepageCelebrities.length > 0 && (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {homepageCelebrities.map((celebrity) => (
                <Link
                  key={celebrity.id}
                  href={`/celebrities/${celebrity.slug}`}
                  className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#f6f6f3] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-72 overflow-hidden bg-black">
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
                      <div className="flex h-full items-center justify-center text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                        No Photo
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {celebrity.verified && (
                      <div className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold tracking-wider text-black/60 backdrop-blur">
                        VERIFIED
                      </div>
                    )}

                    {celebrity.featured && (
                      <div className="absolute bottom-5 left-5 rounded-full bg-black/80 px-3 py-1 text-[9px] font-semibold tracking-wider text-white backdrop-blur">
                        FEATURED
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                      {celebrity.category}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      {celebrity.name}
                    </h3>

                    {celebrity.location && (
                      <p className="mt-2 text-xs text-black/40">
                        {celebrity.location}
                      </p>
                    )}

                    <p className="mt-4 text-sm font-medium text-black/45 transition group-hover:text-black">
                      View profile →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================
          EVENTS
      ========================== */}
      <HomeEvents />

      {/* =========================
          FAN CARD
      ========================== */}
      <section
        id="fan-cards"
        className="scroll-mt-24 bg-[#151515] text-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Fan Cards
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Become part of the experience.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/50 sm:text-base">
              Apply for an official fan card and access member experiences,
              celebrity updates, events, and exclusive opportunities.
            </p>

            <Link
              href="/fan-card/apply"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Apply for a Fan Card
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          BOOKING CTA
      ========================== */}
      <section
        id="bookings"
        className="scroll-mt-24 bg-[#f6f6f3]"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
            Work With Our Talent
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Bring your next project to life.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-black/45">
            Submit a booking request and our management team will help connect
            you with the right talent for your project.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black/80"
          >
            Start a Booking Request
          </Link>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================== */}
      <section
        id="about"
        className="scroll-mt-24 border-t border-black/10 bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              About
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
              Built around talent.
            </h2>
          </div>

          <p className="max-w-xl text-base leading-8 text-black/50">
            Celebrity Management brings talent representation, member
            services, bookings, events, and fan experiences together in one
            professional platform. Our goal is to make every interaction
            simple, secure, and memorable.
          </p>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer
        id="contact"
        className="border-t border-black/10 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">
                  CM
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.18em]">
                    CELEBRITY
                  </p>

                  <p className="text-[8px] tracking-[0.3em] text-black/40">
                    MANAGEMENT
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-black/40">
                A professional platform for talent, members, bookings, and
                opportunities.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-black/50">
              <Link href="/celebrities" className="hover:text-black">
                Celebrities
              </Link>

              <Link href="/fan-card/apply" className="hover:text-black">
                Fan Cards
              </Link>

              <Link href="/booking" className="hover:text-black">
                Bookings
              </Link>

              <Link href="/contact" className="hover:text-black">
                Contact
              </Link>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 text-xs text-black/35">
            © 2026 Celebrity Management. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}