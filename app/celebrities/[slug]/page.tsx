"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  date_of_birth: string | null;
  marital_status: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export default function CelebrityProfilePage() {
  const params = useParams();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCelebrity() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

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
          featured,
          date_of_birth,
          marital_status,
          social_instagram,
          social_twitter,
          social_facebook,
          social_tiktok,
          social_youtube
        `)
        .eq("slug", slug)
        .eq("management_status", "active")
        .maybeSingle();

      if (error) {
        console.error(
          "CELEBRITY PROFILE ERROR:",
          error
        );

        setCelebrity(null);
        setLoading(false);
        return;
      }

      setCelebrity(data);
      setLoading(false);
    }

    loadCelebrity();
  }, [slug]);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f2] text-black">
        <header className="border-b border-black/10 bg-[#f5f5f2]">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
            <div className="h-5 w-52 animate-pulse rounded bg-black/10" />
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-black/10 bg-white lg:grid-cols-2">
            <div className="min-h-[500px] animate-pulse bg-black/10 lg:min-h-[700px]" />

            <div className="space-y-6 p-8 sm:p-12 lg:p-16">
              <div className="h-3 w-28 animate-pulse rounded bg-black/10" />

              <div className="h-14 w-3/4 animate-pulse rounded bg-black/10" />

              <div className="h-10 w-48 animate-pulse rounded-full bg-black/10" />

              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 animate-pulse rounded-2xl bg-black/10" />
                <div className="h-24 animate-pulse rounded-2xl bg-black/10" />
              </div>

              <div className="h-px bg-black/10" />

              <div className="space-y-3">
                <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
                <div className="h-24 animate-pulse rounded bg-black/10" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!celebrity) {
    return (
      <main className="min-h-screen bg-[#f5f5f2] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
            Celebrity Management
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black">
            Celebrity not found
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/55">
            The celebrity profile you are looking for does not
            exist or is currently unavailable.
          </p>

          <Link
            href="/celebrities"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Back to Celebrities
          </Link>
        </div>
      </main>
    );
  }

  const age = calculateAge(celebrity.date_of_birth);

  const availability = celebrity.booking_available
    ? "Available for selected bookings"
    : "Currently unavailable for bookings";

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-black">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="border-b border-black/10 bg-[#f5f5f2]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.22em]"
          >
            Celebrity Management
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-black/60 md:flex">
            <Link
              href="/"
              className="transition hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/celebrities"
              className="font-medium text-black"
            >
              Celebrities
            </Link>

            <Link
              href="/fan-card/apply"
              className="transition hover:text-black"
            >
              Fan Cards
            </Link>

            <Link
              href="/booking"
              className="transition hover:text-black"
            >
              Book a Celebrity
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/member/login"
              className="hidden text-sm font-medium text-black/70 transition hover:text-black sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/member/register"
              className="rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <Link
          href="/celebrities"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40 transition hover:text-black"
        >
          ← Back to Celebrities
        </Link>
      </div>

      {/* =====================================================
          MAIN PROFILE
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-16">
        <div className="grid overflow-hidden rounded-[2rem] border border-black/10 bg-white lg:grid-cols-2">
          {/* Celebrity Image */}

          <div className="relative min-h-[500px] bg-black lg:min-h-[700px]">
            {celebrity.image_url ? (
              <Image
                src={celebrity.image_url}
                alt={celebrity.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[500px] items-center justify-center text-xs font-semibold uppercase tracking-[0.25em] text-white/40 lg:min-h-[700px]">
                No Profile Photo
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8">
              {celebrity.verified && (
                <div className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black backdrop-blur">
                  ✓ Verified Talent
                </div>
              )}
            </div>
          </div>

          {/* Celebrity Information */}

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
              {celebrity.category}
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              {celebrity.name}
            </h1>

            {/* Badges */}

            <div className="mt-6 flex flex-wrap gap-3">
              {celebrity.verified && (
                <span className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
                  Verified
                </span>
              )}

              {celebrity.location && (
                <span className="rounded-full border border-black/10 bg-[#f5f5f2] px-4 py-2 text-xs font-medium text-black/60">
                  {celebrity.location}
                </span>
              )}

              {celebrity.featured && (
                <span className="rounded-full border border-black/10 bg-[#f5f5f2] px-4 py-2 text-xs font-medium text-black/60">
                  Featured
                </span>
              )}
            </div>

            {/* Age + Marital Status */}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/10 bg-[#f5f5f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                  Age
                </p>

                <p className="mt-2 text-xl font-semibold text-black">
                  {age ?? "Not listed"}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#f5f5f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                  Marital Status
                </p>

                <p className="mt-2 text-xl font-semibold text-black">
                  {celebrity.marital_status || "Not listed"}
                </p>
              </div>
            </div>

            <div className="my-10 h-px bg-black/10" />

            {/* About */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                About
              </p>

              <p className="mt-5 text-base leading-8 text-black/65">
                {celebrity.biography ||
                  "Biography information is currently being prepared."}
              </p>
            </div>

            {/* Availability */}

            <div className="mt-10 rounded-2xl border border-black/10 bg-[#f5f5f2] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Booking Availability
              </p>

              <p className="mt-2 text-sm font-medium text-black">
                {availability}
              </p>
            </div>

            {/* Buttons */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {celebrity.booking_available && (
                <Link
                  href={`/booking?celebrity=${celebrity.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-black px-7 py-4 text-sm font-semibold text-white transition hover:bg-black/80"
                >
                  Book {celebrity.name}
                </Link>
              )}

              <Link
                href={`/donate?celebrity=${celebrity.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-black px-7 py-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Donate
              </Link>

              <Link
                href="/celebrities"
                className="inline-flex items-center justify-center rounded-full border border-black/15 px-7 py-4 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                View All
              </Link>
            </div>

            {/* Social Links */}

            {(celebrity.social_instagram ||
              celebrity.social_twitter ||
              celebrity.social_facebook ||
              celebrity.social_tiktok ||
              celebrity.social_youtube) && (
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  Official Social Profiles
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {celebrity.social_instagram && (
                    <a
                      href={celebrity.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                    >
                      Instagram
                    </a>
                  )}

                  {celebrity.social_twitter && (
                    <a
                      href={celebrity.social_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                    >
                      Twitter
                    </a>
                  )}

                  {celebrity.social_facebook && (
                    <a
                      href={celebrity.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                    >
                      Facebook
                    </a>
                  )}

                  {celebrity.social_tiktok && (
                    <a
                      href={celebrity.social_tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                    >
                      TikTok
                    </a>
                  )}

                  {celebrity.social_youtube && (
                    <a
                      href={celebrity.social_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          BOOKING CTA
      ===================================================== */}

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-[2rem] bg-black px-8 py-14 text-white sm:px-12 lg:px-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                Private Bookings
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Interested in booking {celebrity.name}?
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/55">
                Submit a booking request with your event details and
                our management team will review your request.
              </p>

              {celebrity.booking_available && (
                <Link
                  href={`/booking?celebrity=${celebrity.slug}`}
                  className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85"
                >
                  Start Booking Request
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-black/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Celebrity Management.
            All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link
              href="/about"
              className="transition hover:text-black"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-black"
            >
              Contact
            </Link>

            <Link
              href="/member/login"
              className="transition hover:text-black"
            >
              Member Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}