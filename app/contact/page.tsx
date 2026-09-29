"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#151515]">

      {/* =========================
          NAVIGATION
      ========================== */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
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
              className="text-sm text-black/60 transition hover:text-black"
            >
              Talent
            </Link>

            <Link
              href="/fan-card/apply"
              className="text-sm text-black/60 transition hover:text-black"
            >
              Fan Cards
            </Link>

            <Link
              href="/booking"
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
              className="text-sm font-medium text-black"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
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

          {/* Mobile Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black lg:hidden"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-black/10 bg-[#f6f6f3] lg:hidden">
            <nav className="mx-auto max-w-7xl px-5 py-5">

              <div className="flex flex-col">
                <Link
                  href="/celebrities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-black/10 py-4 text-base font-medium"
                >
                  Talent
                </Link>

                <Link
                  href="/fan-card/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-black/10 py-4 text-base font-medium"
                >
                  Fan Cards
                </Link>

                <Link
                  href="/booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-black/10 py-4 text-base font-medium"
                >
                  Bookings
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-black/10 py-4 text-base font-medium"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-black/10 py-4 text-base font-medium"
                >
                  Contact
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/member/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-medium"
                >
                  Sign In
                </Link>

                <Link
                  href="/member/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white"
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
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Contact
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Let&apos;s start a
            <br />
            <span className="text-black/40">conversation.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
            Whether you are looking to work with our talent, become a member,
            discuss an event, or learn more about Celebrity Management, our
            team is ready to hear from you.
          </p>

        </div>
      </section>

      {/* =========================
          CONTACT CONTENT
      ========================== */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">

          {/* Contact Information */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              Get In Touch
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              We&apos;re here to help.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-black/50">
              Send us a message and our management team will review your
              request and get back to you.
            </p>

            <div className="mt-10 space-y-7">

              {/* Email */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  Email
                </p>

                <p className="mt-2 text-sm font-medium">
                  hello@celebritymanagement.com
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  Phone
                </p>

                <p className="mt-2 text-sm font-medium">
                  +1 (000) 000-0000
                </p>
              </div>

              {/* Office */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  Office
                </p>

                <p className="mt-2 max-w-xs text-sm leading-6 font-medium">
                  Celebrity Management
                  <br />
                  Management &amp; Talent Services
                  <br />
                  By Appointment
                </p>
              </div>

            </div>

            {/* Small CTA */}
            <div className="mt-12 rounded-[1.5rem] bg-[#151515] p-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Looking to book talent?
              </p>

              <p className="mt-3 text-lg font-semibold">
                Go directly to our booking request.
              </p>

              <Link
                href="/booking"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Start a Booking
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[2rem] border border-black/10 bg-[#f6f6f3] p-6 sm:p-8 lg:p-10">

            {!submitted ? (
              <>
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                    Send A Message
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    How can we help?
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  {/* Name + Email */}
                  <div className="grid gap-6 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/50"
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/50"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30"
                      />
                    </div>

                  </div>

                  {/* Phone + Subject */}
                  <div className="grid gap-6 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/50"
                      >
                        Phone
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (000) 000-0000"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/50"
                      >
                        Subject
                      </label>

                      <select
                        id="subject"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black/30"
                      >
                        <option value="">Select a subject</option>
                        <option value="booking">
                          Celebrity Booking
                        </option>
                        <option value="membership">
                          Membership
                        </option>
                        <option value="fan-card">
                          Fan Card
                        </option>
                        <option value="event">
                          Event
                        </option>
                        <option value="general">
                          General Inquiry
                        </option>
                      </select>
                    </div>

                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/50"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={7}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-black px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black/80"
                  >
                    Send Message
                  </button>

                  <p className="text-center text-[11px] leading-5 text-black/35">
                    Your message will be reviewed by our management team.
                  </p>

                </form>
              </>
            ) : (
              /* SUCCESS MESSAGE */
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
                  ✓
                </div>

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                  Message Sent
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Thank you for reaching out.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-black/45">
                  Your message has been received. Our management team will
                  review your request and respond as soon as possible.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold transition hover:bg-black/5"
                  >
                    Send Another Message
                  </button>

                  <Link
                    href="/"
                    className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
                  >
                    Back Home
                  </Link>

                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-black/10 bg-white">
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
              <Link
                href="/celebrities"
                className="transition hover:text-black"
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
                Bookings
              </Link>

              <Link
                href="/about"
                className="transition hover:text-black"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="font-medium text-black"
              >
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