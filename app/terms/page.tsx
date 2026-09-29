"use client";

import { useState } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="text-sm text-black/60 transition hover:text-black"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/member/login"
              className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:bg-black/5"
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
                  className="rounded-full border border-black/15 bg-white px-5 py-3 text-center text-sm font-semibold"
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
          PAGE HEADER
      ========================== */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Legal
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Terms of Service
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-black/50 sm:text-base">
            These Terms of Service govern your use of the Celebrity Management
            website, member services, bookings, fan cards, events, and related
            services.
          </p>

          <p className="mt-5 text-xs text-black/35">
            Last updated: September 25, 2026
          </p>

        </div>
      </section>

      {/* =========================
          TERMS CONTENT
      ========================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">

          <div className="max-w-4xl space-y-12">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                1. Acceptance of These Terms
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                By accessing or using Celebrity Management, you agree to be
                bound by these Terms of Service. If you do not agree with these
                terms, please do not use the website or our services.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                These terms apply to visitors, registered members, clients,
                booking customers, and other users of the platform.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                2. Eligibility
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                You must provide accurate information when creating an account
                or submitting information through the website. You are
                responsible for maintaining the accuracy of the information
                associated with your account.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                If you are using the platform on behalf of a business or
                organization, you confirm that you have authority to act on
                behalf of that organization.
              </p>
            </section>

            {/* Accounts */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                3. Member Accounts
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Certain features may require you to create a member account.
                You are responsible for keeping your login credentials
                confidential and for activity occurring through your account.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                You should notify us promptly if you believe your account has
                been accessed without authorization.
              </p>
            </section>

            {/* Services */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                4. Our Services
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Celebrity Management provides a platform for talent discovery,
                celebrity booking inquiries, membership services, fan cards,
                events, communications, and related management services.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Availability of specific services, talent, events, and
                opportunities may change from time to time.
              </p>
            </section>

            {/* Celebrity Bookings */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                5. Celebrity Bookings
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Submitting a booking request does not automatically create a
                confirmed engagement. Booking requests are subject to review,
                availability, applicable terms, pricing, scheduling, and
                confirmation by the appropriate management representatives.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                A booking may require additional documentation, agreements,
                deposits, payments, or other conditions before it becomes
                confirmed.
              </p>
            </section>

            {/* Fan Cards */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                6. Fan Cards and Membership
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Fan Cards and membership services may be subject to application,
                verification, approval, expiration dates, membership levels,
                and additional requirements.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                A Fan Card does not by itself guarantee access to a celebrity,
                event, private communication, booking, or any other specific
                benefit unless that benefit is expressly provided by the
                applicable program.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                7. Acceptable Use
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                You agree not to misuse the platform or use it for unlawful,
                fraudulent, abusive, or unauthorized purposes.
              </p>

              <ul className="mt-5 space-y-3 text-sm leading-7 text-black/55">
                <li>• Do not impersonate another person or organization.</li>
                <li>• Do not submit intentionally false information.</li>
                <li>• Do not attempt to gain unauthorized access to accounts.</li>
                <li>• Do not interfere with the operation of the platform.</li>
                <li>• Do not use the platform to distribute malicious software.</li>
                <li>• Do not use the platform for fraudulent transactions.</li>
              </ul>
            </section>

            {/* Communications */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                8. Communications
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                The platform may provide messaging and communication features
                between members and authorized management personnel.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Communication features must be used respectfully and only for
                legitimate purposes connected to the services provided through
                the platform.
              </p>
            </section>

            {/* Payments */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                9. Payments and Fees
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Certain services may require payment. Applicable prices,
                deposits, fees, payment schedules, cancellation conditions, and
                refund policies may be provided separately for the relevant
                service or transaction.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                You agree to provide accurate billing and payment information
                when required.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                10. Intellectual Property
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Unless otherwise stated, the website design, branding, text,
                software, graphics, and other platform materials are owned by
                or licensed to Celebrity Management and may be protected by
                applicable intellectual property laws.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                You may not copy, reproduce, modify, distribute, or commercially
                exploit platform materials without appropriate authorization.
              </p>
            </section>

            {/* Third Party */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                11. Third-Party Services
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                The platform may contain links to third-party websites,
                services, payment providers, social networks, or other
                resources. Third-party services may have their own terms and
                privacy policies.
              </p>
            </section>

            {/* Availability */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                12. Service Availability
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                We may update, modify, suspend, or discontinue portions of the
                platform or its features from time to time.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                We do not guarantee that the website or every feature will
                always be available without interruption or error.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                13. Account Suspension or Termination
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                We may restrict, suspend, or terminate access to an account or
                service where we reasonably believe there has been a violation
                of these terms, misuse of the platform, fraudulent activity, or
                another legitimate reason requiring action.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                14. Disclaimer
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Information presented on the platform may change and should not
                be understood as a guarantee that a particular celebrity,
                service, event, or opportunity will be available.
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                Specific services may be governed by additional agreements or
                terms provided at the time of booking, membership, payment, or
                another transaction.
              </p>
            </section>

            {/* Limitation */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                15. Limitation of Liability
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                To the extent permitted by applicable law, Celebrity Management
                will not be responsible for indirect, incidental, special, or
                consequential losses arising from your use of the platform or
                inability to use the platform.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                16. Changes to These Terms
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                We may update these Terms of Service from time to time. Updated
                terms will be posted on this page with a revised effective or
                update date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                17. Contact Us
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55">
                If you have questions about these Terms of Service, please
                contact our management team.
              </p>

              <Link
                href="/contact"
                className="mt-5 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                Contact Management
              </Link>
            </section>


          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                Celebrity Management
              </p>

              <p className="mt-2 text-xs text-black/30">
                Talent. Access. Opportunity.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 text-xs text-black/40">

              <Link
                href="/terms"
                className="font-medium text-black"
              >
                Terms
              </Link>

              <Link
                href="/privacy"
                className="transition hover:text-black"
              >
                Privacy
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-black"
              >
                Contact
              </Link>

            </div>

          </div>

          <div className="mt-8 border-t border-black/10 pt-6 text-xs text-black/30">
            © 2026 Celebrity Management. All rights reserved.
          </div>

        </div>
      </footer>

    </main>
  );
}