"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">

     <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="border-b border-black/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-4xl">

            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-black" />

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                About Celebrity Management
              </span>
            </div>

            <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              Talent.
              <br />
              Access.
              <br />
              <span className="text-black/35">
                Opportunity.
              </span>
            </h1>

            <p className="mt-10 max-w-2xl text-base leading-8 text-black/55">
              Celebrity Management is a professional platform connecting
              exceptional talent with people, brands, organizations and
              experiences around the world.
            </p>

          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}
      <section className="border-b border-black/10 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                Who We Are
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                A modern approach to celebrity management.
              </h2>
            </div>

            <div className="space-y-6 text-sm leading-7 text-black/55">

              <p>
                Celebrity Management brings talent, opportunities and
                professional services together through one organized platform.
              </p>

              <p>
                Our platform is designed to make it easier for clients to
                discover talent, request bookings, become members and access
                experiences connected to the celebrities they follow.
              </p>

              <p>
                Behind the platform is a management workflow designed to help
                teams organize talent, members, bookings, events, payments,
                contracts, communications and documents.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT WE DO
      ===================================================== */}
      <section className="border-b border-black/10 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
              What We Do
            </div>

            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              Built around people and opportunity.
            </h2>
          </div>

          <div className="grid border-t border-black/10 sm:grid-cols-2 lg:grid-cols-4">

            {/* 01 */}
            <div className="border-b border-black/10 px-6 py-8 sm:border-r lg:px-8 lg:py-10">

              <div className="text-[10px] font-bold tracking-[0.2em] text-black/35">
                01
              </div>

              <h3 className="mt-6 text-xl font-medium">
                Talent
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Discover a growing roster of celebrities and professional
                talent across entertainment, sports and other categories.
              </p>

            </div>

            {/* 02 */}
            <div className="border-b border-black/10 px-6 py-8 sm:lg:border-r lg:px-8 lg:py-10">

              <div className="text-[10px] font-bold tracking-[0.2em] text-black/35">
                02
              </div>

              <h3 className="mt-6 text-xl font-medium">
                Bookings
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Submit professional booking requests for events, appearances,
                performances, campaigns and special occasions.
              </p>

            </div>

            {/* 03 */}
            <div className="border-b border-black/10 px-6 py-8 sm:border-r lg:border-b-0 lg:px-8 lg:py-10">

              <div className="text-[10px] font-bold tracking-[0.2em] text-black/35">
                03
              </div>

              <h3 className="mt-6 text-xl font-medium">
                Membership
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Members can create accounts and participate in experiences
                offered through the Celebrity Management platform.
              </p>

            </div>

            {/* 04 */}
            <div className="px-6 py-8 lg:px-8 lg:py-10">

              <div className="text-[10px] font-bold tracking-[0.2em] text-black/35">
                04
              </div>

              <h3 className="mt-6 text-xl font-medium">
                Management
              </h3>

              <p className="mt-4 text-sm leading-6 text-black/50">
                Our management system is designed to organize talent, members,
                bookings, events, communications and business operations.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="border-b border-black/10 bg-black py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                How It Works
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                One platform.
                <br />
                Multiple possibilities.
              </h2>

              <p className="mt-7 max-w-lg text-sm leading-7 text-white/50">
                Whether you are discovering talent, arranging an appearance
                or becoming a member, the platform is designed to keep the
                experience simple and organized.
              </p>
            </div>

            <div className="border-t border-white/10">

              {/* Step 1 */}
              <div className="border-b border-white/10 py-7">
                <div className="flex gap-6">

                  <div className="text-[10px] font-bold text-white/30">
                    01
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">
                      Discover
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/45">
                      Browse celebrities and explore their profiles,
                      categories and available opportunities.
                    </p>
                  </div>

                </div>
              </div>

              {/* Step 2 */}
              <div className="border-b border-white/10 py-7">
                <div className="flex gap-6">

                  <div className="text-[10px] font-bold text-white/30">
                    02
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">
                      Connect
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/45">
                      Submit a booking request or create a member account to
                      begin your relationship with the platform.
                    </p>
                  </div>

                </div>
              </div>

              {/* Step 3 */}
              <div className="border-b border-white/10 py-7">
                <div className="flex gap-6">

                  <div className="text-[10px] font-bold text-white/30">
                    03
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">
                      Experience
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/45">
                      Our team manages the process and keeps you informed
                      throughout your experience.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="border-b border-black/10 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">

          <div className="mx-auto max-w-3xl">

            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
              Get Started
            </div>

            <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              Ready to connect?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/50">
              Explore our talent, make a booking request or become part of the
              Celebrity Management community.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">

              <Link
                href="/celebrities"
                className="bg-black px-7 py-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-black/80"
              >
                Explore Talent
              </Link>

              <Link
                href="/booking"
                className="border border-black/15 bg-white px-7 py-4 text-xs font-semibold uppercase tracking-wider transition hover:border-black"
              >
                Book a Celebrity
              </Link>

              <Link
                href="/member/register"
                className="border border-black/15 bg-white px-7 py-4 text-xs font-semibold uppercase tracking-wider transition hover:border-black"
              >
                Join Now
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-black text-white">

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

          <div className="grid gap-12 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">

              <Link href="/" className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center bg-white text-sm font-bold text-black">
                  CM
                </div>

                <div>
                  <div className="text-[11px] font-bold tracking-[0.22em]">
                    CELEBRITY
                  </div>

                  <div className="text-[11px] font-bold tracking-[0.22em]">
                    MANAGEMENT
                  </div>
                </div>

              </Link>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/35">
                Talent. Access. Opportunity.
                <br />
                Professional celebrity management and exclusive experiences.
              </p>

            </div>

            {/* Explore */}
            <div>

              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                Explore
              </div>

              <div className="space-y-3 text-sm text-white/50">

                <Link
                  href="/celebrities"
                  className="block transition hover:text-white"
                >
                  Talent
                </Link>

                <Link
                  href="/booking"
                  className="block transition hover:text-white"
                >
                  Bookings
                </Link>

                <Link
                  href="/about"
                  className="block text-white"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="block transition hover:text-white"
                >
                  Contact
                </Link>

              </div>

            </div>

            {/* Members */}
            <div>

              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                Members
              </div>

              <div className="space-y-3 text-sm text-white/50">

                <Link
                  href="/member/login"
                  className="block transition hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  href="/member/register"
                  className="block transition hover:text-white"
                >
                  Create Account
                </Link>

                <Link
                  href="/fan-card/apply"
                  className="block transition hover:text-white"
                >
                  Fan Cards
                </Link>

              </div>

            </div>

          </div>

          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-[10px] uppercase tracking-wider text-white/20 sm:flex-row">

            <div>
              © {new Date().getFullYear()} Celebrity Management
            </div>

            <div className="flex gap-6">
              <span>Privacy</span>
              <span>Terms</span>
            </div>

          </div>

        </div>
      </footer>

    </main>
  );
}