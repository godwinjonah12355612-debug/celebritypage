"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRememberMe(false);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error("LOGIN ERROR:", error);

        setLoading(false);
        setErrorMessage(error.message);
        setPassword("");
        setShowPassword(false);

        return;
      }

      if (!data.user || !data.session) {
        console.error("LOGIN SESSION MISSING:", data);

        setLoading(false);
        setErrorMessage(
          "Login succeeded, but your browser session could not be created. Please try again."
        );

        setPassword("");
        setShowPassword(false);

        return;
      }

      console.log("LOGIN USER:", data.user);
      console.log("LOGIN SESSION CREATED: YES");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("PROFILE LOAD ERROR:", profileError);

        setLoading(false);
        setErrorMessage("Your account profile could not be loaded.");
        setPassword("");
        setShowPassword(false);

        return;
      }

      if (!profile) {
        console.error("PROFILE NOT FOUND:", data.user.id);

        setLoading(false);
        setErrorMessage("Your account profile could not be found.");
        setPassword("");
        setShowPassword(false);

        return;
      }

      const managementRoles = [
        "staff",
        "manager",
        "administrator",
        "super_admin",
      ];

      const isManagementUser =
        profile.status === "active" &&
        managementRoles.includes(profile.role);

      console.log("PROFILE:", profile);
      console.log("IS MANAGEMENT USER:", isManagementUser);

      setEmail("");
      setPassword("");
      setShowPassword(false);
      setRememberMe(false);

      /*
       * IMPORTANT:
       * Use a full browser navigation after login.
       * This gives Supabase's newly-created session cookies
       * time to reach the server before Management loads.
       */
      if (isManagementUser) {
        window.location.href = "/management";
      } else {
        window.location.href = "/account";
      }
    } catch (error) {
      console.error("UNEXPECTED LOGIN ERROR:", error);

      setLoading(false);
      setErrorMessage(
        "Something went wrong while signing you in. Please try again."
      );

      setPassword("");
      setShowPassword(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1220] text-sm font-bold text-white shadow-lg">
                CM
              </div>

              <div className="text-left">
                <div className="text-sm font-bold tracking-[0.18em] text-[#0b1220]">
                  CELEBRITY
                </div>

                <div className="text-xs font-medium tracking-[0.3em] text-[#a77b16]">
                  MANAGEMENT
                </div>
              </div>
            </Link>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-[#0b1220]">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your Celebrity Management account.
              </p>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/member/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0b1220] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#111c31] focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Create account */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/member/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link
              href="/"
              className="hover:text-slate-600"
            >
              Home
            </Link>

            <span>•</span>

            <Link
              href="/about"
              className="hover:text-slate-600"
            >
              About
            </Link>

            <span>•</span>

            <Link
              href="/contact"
              className="hover:text-slate-600"
            >
              Contact
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}