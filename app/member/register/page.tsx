"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage(
        "Your account has been created. Please check your email to confirm your account if email confirmation is required."
      );

      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setAgreeTerms(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#151515]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/member/login"
              className="rounded-full px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* REGISTER SECTION */}
      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              Membership
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Create your account.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/50">
              Join Celebrity Management and create your member profile.
            </p>
          </div>

          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-black/10 bg-[#f6f6f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-black/10 bg-[#f6f6f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                />
              </div>

              {/* PHONE */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  autoComplete="tel"
                  className="w-full rounded-xl border border-black/10 bg-[#f6f6f3] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-black/10 bg-[#f6f6f3] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-black/45 hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-black/10 bg-[#f6f6f3] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/5"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-black/45 hover:text-black"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <label className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20"
                />

                <span className="text-sm leading-6 text-black/50">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-black underline underline-offset-4"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-black underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                  {message}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-7 border-t border-black/10 pt-6 text-center">
              <p className="text-sm text-black/45">
                Already have an account?{" "}
                <Link
                  href="/member/login"
                  className="font-semibold text-black underline underline-offset-4"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.18em]">
              CELEBRITY MANAGEMENT
            </p>

            <p className="mt-2 text-xs text-black/40">
              Talent. Access. Opportunity.
            </p>
          </div>

          <div className="flex gap-5 text-xs text-black/40">
            <Link
              href="/terms"
              className="transition hover:text-black"
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
      </footer>
    </main>
  );
}