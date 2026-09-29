"use client";

import Link from "next/link";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-bold tracking-widest text-white">
              CM
            </div>

            <div className="hidden sm:block">
              <p className="text-[11px] font-bold tracking-[0.2em]">
                CELEBRITY
              </p>
              <p className="text-[11px] font-bold tracking-[0.2em]">
                MANAGEMENT
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/celebrities"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Talent
            </Link>

            <Link
              href="/fan-card/apply"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Fan Cards
            </Link>

            <Link
              href="/booking"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Bookings
            </Link>

            <Link
              href="/about"
              className="text-sm text-black/70 transition hover:text-black"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm text-black/70 transition hover:text-black"
            >
              Contact
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/member/login"
              className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:bg-black/5"
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-xl">
              {mobileMenuOpen ? "×" : "☰"}
            </span>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="border-t border-black/10 bg-[#f6f6f3] md:hidden">
            <div className="mx-auto max-w-7xl px-6 py-5">
              <nav className="flex flex-col">
                <Link
                  href="/celebrities"
                  onClick={closeMenu}
                  className="border-b border-black/10 py-4 text-sm font-medium"
                >
                  Talent
                </Link>

                <Link
                  href="/fan-card/apply"
                  onClick={closeMenu}
                  className="border-b border-black/10 py-4 text-sm font-medium"
                >
                  Fan Cards
                </Link>

                <Link
                  href="/booking"
                  onClick={closeMenu}
                  className="border-b border-black/10 py-4 text-sm font-medium"
                >
                  Bookings
                </Link>

                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="border-b border-black/10 py-4 text-sm font-medium"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="border-b border-black/10 py-4 text-sm font-medium"
                >
                  Contact
                </Link>

                <div className="flex gap-3 pt-5">
                  <Link
                    href="/member/login"
                    onClick={closeMenu}
                    className="flex-1 rounded-full border border-black/15 px-5 py-3 text-center text-sm font-medium"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/member/register"
                    onClick={closeMenu}
                    className="flex-1 rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white"
                  >
                    Join Now
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* PAGE HEADER */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
            Legal
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
            This Privacy Policy explains how Celebrity Management may collect,
            use, store, and protect information when you use our website and
            services.
          </p>

          <p className="mt-5 text-sm text-black/40">
            Last updated: September 25, 2026
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-3xl space-y-14">
            {/* INTRODUCTION */}
            <div>
              <h2 className="text-2xl font-semibold">
                1. Introduction
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Celebrity Management respects your privacy and is committed to
                handling personal information responsibly. This Privacy Policy
                describes the types of information that may be collected when
                you visit our website, create an account, apply for a fan card,
                submit a celebrity booking request, communicate with us, or
                otherwise use our services.
              </p>
            </div>

            {/* INFORMATION WE COLLECT */}
            <div>
              <h2 className="text-2xl font-semibold">
                2. Information We Collect
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Depending on how you use the platform, we may collect
                information that you voluntarily provide to us.
              </p>

              <ul className="mt-5 list-disc space-y-3 pl-6 leading-7 text-black/65">
                <li>Full name</li>
                <li>Email address</li>
                <li>Telephone or mobile number</li>
                <li>Account login information</li>
                <li>Event and booking information</li>
                <li>Fan card and membership information</li>
                <li>Messages and communications with our team</li>
                <li>Information submitted through contact forms</li>
                <li>Information you provide when requesting services</li>
              </ul>
            </div>

            {/* AUTOMATIC INFORMATION */}
            <div>
              <h2 className="text-2xl font-semibold">
                3. Information Collected Automatically
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                When you access our website, certain technical information may
                be collected automatically. This may include information such
                as browser type, device type, operating system, pages visited,
                approximate usage information, and technical logs.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                This information may be used to maintain, secure, troubleshoot,
                and improve the website.
              </p>
            </div>

            {/* HOW WE USE INFORMATION */}
            <div>
              <h2 className="text-2xl font-semibold">
                4. How We Use Your Information
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Information may be used for purposes including:
              </p>

              <ul className="mt-5 list-disc space-y-3 pl-6 leading-7 text-black/65">
                <li>Creating and managing member accounts</li>
                <li>Processing fan card applications</li>
                <li>Managing celebrity booking requests</li>
                <li>Responding to questions and support requests</li>
                <li>Communicating about bookings and services</li>
                <li>Providing account-related notifications</li>
                <li>Maintaining platform security</li>
                <li>Improving website functionality and user experience</li>
                <li>Preventing fraud, abuse, or unauthorized activity</li>
                <li>Complying with applicable legal obligations</li>
              </ul>
            </div>

            {/* ACCOUNT INFORMATION */}
            <div>
              <h2 className="text-2xl font-semibold">
                5. Member Accounts
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                If you create an account, you are responsible for keeping your
                login credentials secure. Please notify us if you believe that
                your account has been accessed without authorization.
              </p>
            </div>

            {/* BOOKINGS */}
            <div>
              <h2 className="text-2xl font-semibold">
                6. Booking Information
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                When you submit a celebrity booking request, information
                connected to the request may be used to evaluate, communicate
                about, and manage the booking.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                This may include event details, requested talent, location,
                date, budget information, contact information, and other
                information you choose to provide.
              </p>
            </div>

            {/* FAN CARDS */}
            <div>
              <h2 className="text-2xl font-semibold">
                7. Fan Cards and Membership
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Information submitted for a fan card or membership application
                may be used to review the application, manage membership
                records, issue membership credentials, and provide related
                services.
              </p>
            </div>

            {/* MESSAGES */}
            <div>
              <h2 className="text-2xl font-semibold">
                8. Messages and Communications
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Communications submitted through the platform may be stored or
                processed in order to provide customer support, manage
                bookings, respond to inquiries, and maintain the security and
                operation of the service.
              </p>
            </div>

            {/* SHARING */}
            <div>
              <h2 className="text-2xl font-semibold">
                9. How Information May Be Shared
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                We may share information when reasonably necessary to operate
                the service, provide requested services, process transactions,
                maintain security, or comply with legal obligations.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                Information may be shared with service providers or technology
                partners that assist with hosting, authentication, payments,
                communications, analytics, security, or other platform
                operations.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                We do not intend to sell personal information as part of the
                ordinary operation of the platform.
              </p>
            </div>

            {/* PAYMENTS */}
            <div>
              <h2 className="text-2xl font-semibold">
                10. Payments
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                If payment functionality is introduced, payment information
                may be processed by third-party payment providers. Depending on
                the payment system used, we may not directly store complete
                payment card information on our own servers.
              </p>
            </div>

            {/* SECURITY */}
            <div>
              <h2 className="text-2xl font-semibold">
                11. Data Security
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                We intend to use reasonable technical and organizational
                safeguards to protect information against unauthorized access,
                misuse, alteration, or disclosure.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                However, no internet-based system can guarantee absolute
                security.
              </p>
            </div>

            {/* RETENTION */}
            <div>
              <h2 className="text-2xl font-semibold">
                12. Data Retention
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Information may be retained for as long as reasonably necessary
                to provide services, maintain business and transaction
                records, resolve disputes, prevent abuse, comply with legal
                requirements, and support legitimate operational needs.
              </p>
            </div>

            {/* YOUR RIGHTS */}
            <div>
              <h2 className="text-2xl font-semibold">
                13. Your Privacy Choices
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Depending on applicable law, you may have rights concerning your
                personal information, including the ability to request access,
                correction, or deletion of certain information.
              </p>

              <p className="mt-4 leading-8 text-black/65">
                You may also contact us with questions about how your
                information is handled.
              </p>
            </div>

            {/* COOKIES */}
            <div>
              <h2 className="text-2xl font-semibold">
                14. Cookies and Similar Technologies
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                The website may use cookies or similar technologies to support
                authentication, remember preferences, improve functionality,
                understand usage, and maintain security.
              </p>
            </div>

            {/* CHILDREN */}
            <div>
              <h2 className="text-2xl font-semibold">
                15. Children&apos;s Privacy
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Our services are not intended to knowingly collect personal
                information from children in circumstances where applicable law
                requires parental or guardian consent.
              </p>
            </div>

            {/* THIRD PARTY LINKS */}
            <div>
              <h2 className="text-2xl font-semibold">
                16. Third-Party Websites
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                Our website may contain links to third-party websites or
                services. We are not responsible for the privacy practices or
                content of websites that we do not control.
              </p>
            </div>

            {/* CHANGES */}
            <div>
              <h2 className="text-2xl font-semibold">
                17. Changes to This Privacy Policy
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                We may update this Privacy Policy from time to time as the
                website, services, or applicable requirements change. Updated
                versions will be posted on this page with a revised effective
                date.
              </p>
            </div>

            {/* CONTACT */}
            <div>
              <h2 className="text-2xl font-semibold">
                18. Contact Us
              </h2>

              <p className="mt-5 leading-8 text-black/65">
                If you have questions about this Privacy Policy or how your
                information is handled, please contact our team.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold tracking-widest text-black">
                  CM
                </div>

                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em]">
                    CELEBRITY
                  </p>
                  <p className="text-[11px] font-bold tracking-[0.2em]">
                    MANAGEMENT
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
                Talent. Access. Opportunity.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/60">
              <Link
                href="/terms"
                className="transition hover:text-white"
              >
                Terms
              </Link>

              <Link
                href="/privacy"
                className="text-white"
              >
                Privacy
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-xs text-white/35">
              © 2026 Celebrity Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}