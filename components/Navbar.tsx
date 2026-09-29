"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-black text-sm font-bold text-white">
            CM
          </div>

          <div className="hidden sm:block">
            <p className="text-[11px] font-bold tracking-[0.18em] text-black">
              CELEBRITY
            </p>

            <p className="text-[11px] font-bold tracking-[0.18em] text-black">
              MANAGEMENT
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/celebrities"
            className="text-sm font-medium text-black/70 transition hover:text-black"
          >
            Talent
          </Link>

          <Link
            href="/fan-card/apply"
            className="text-sm font-medium text-black/70 transition hover:text-black"
          >
            Fan Cards
          </Link>

          <Link
            href="/booking"
            className="text-sm font-medium text-black/70 transition hover:text-black"
          >
            Bookings
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-black/70 transition hover:text-black"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-black/70 transition hover:text-black"
          >
            Contact
          </Link>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/member/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
          >
            Sign In
          </Link>

          <Link
            href="/member/register"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
          >
            Join Now
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <span className="text-xl leading-none">☰</span>
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="border-t border-black/10 bg-[#f6f6f3] md:hidden">
          <nav className="mx-auto max-w-7xl px-6 py-6">
            
            <div className="flex flex-col">
              <Link
                href="/celebrities"
                onClick={closeMenu}
                className="border-b border-black/10 py-4 text-base font-medium text-black"
              >
                Talent
              </Link>

              <Link
                href="/fan-card/apply"
                onClick={closeMenu}
                className="border-b border-black/10 py-4 text-base font-medium text-black"
              >
                Fan Cards
              </Link>

              <Link
                href="/booking"
                onClick={closeMenu}
                className="border-b border-black/10 py-4 text-base font-medium text-black"
              >
                Bookings
              </Link>

              <Link
                href="/about"
                onClick={closeMenu}
                className="border-b border-black/10 py-4 text-base font-medium text-black"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={closeMenu}
                className="border-b border-black/10 py-4 text-base font-medium text-black"
              >
                Contact
              </Link>
            </div>

            {/* MOBILE ACTIONS */}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/member/login"
                onClick={closeMenu}
                className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-black/5"
              >
                Sign In
              </Link>

              <Link
                href="/member/register"
                onClick={closeMenu}
                className="rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-black/80"
              >
                Join Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}