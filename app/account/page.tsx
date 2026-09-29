"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
};

type FanCard = {
  id: string;
  membership_id: string;
  membership_level: string;
  status: string;
  issue_date: string | null;
  expiry_date: string | null;
};

type Booking = {
  id: string;
  booking_reference: string | null;
  event_type: string;
  event_date: string;
  location: string;
  booking_status: string;
  payment_status: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fanCard, setFanCard] = useState<FanCard | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/member/login");
        return;
      }

      /* PROFILE */
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          display_name,
          email,
          phone,
          role,
          status
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error("ACCOUNT PROFILE ERROR:", profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      /* FAN CARD */
      const { data: fanCardData } = await supabase
        .from("fan_cards")
        .select(`
          id,
          membership_id,
          membership_level,
          status,
          issue_date,
          expiry_date
        `)
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fanCardData) {
        setFanCard(fanCardData as FanCard);
      }

      /* BOOKINGS */
      const { data: bookingData } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          event_type,
          event_date,
          location,
          booking_status,
          payment_status
        `)
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setBookings((bookingData || []) as Booking[]);

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    setMobileMenuOpen(false);

    router.replace("/member/login");
    router.refresh();
  }

  function formatStatus(status: string) {
    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  const displayName =
    profile?.display_name ||
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "Member";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-[#16213e] border-t-transparent" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#172033]">
      <div className="flex min-h-screen">

        {/* =========================================================
            DESKTOP SIDEBAR
        ========================================================= */}
        <aside className="hidden w-72 shrink-0 bg-[#111a2e] text-white lg:flex lg:flex-col">

          {/* LOGO */}
          <div className="flex h-20 items-center border-b border-white/10 px-7">
            <Link
              href="/account"
              className="text-xl font-black tracking-tight"
            >
              CM<span className="text-blue-400">.</span>
            </Link>
          </div>

          {/* PORTAL LABEL */}
          <div className="px-6 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
              Member Portal
            </p>

            <p className="mt-2 text-xs leading-5 text-white/40">
              Manage your membership, bookings and communication.
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="mt-6 flex-1 px-4">

            <SidebarLink
              href="/account"
              label="Dashboard"
              active
              icon="⌂"
            />

            {/* IMPORTANT MESSAGES */}
            <SidebarLink
              href="/account/messages"
              label="Messages"
              icon="✉"
              highlight
            />

            <SidebarLink
              href="/account/bookings"
              label="My Bookings"
              icon="▣"
            />

            <SidebarLink
              href="/fan-card/apply"
              label="Membership"
              icon="◇"
            />

            <SidebarLink
              href="/account/profile"
              label="Profile"
              icon="○"
            />

            <div className="my-6 border-t border-white/10" />

            <SidebarLink
              href="/celebrities"
              label="Browse Celebrities"
              icon="☆"
            />

            <SidebarLink
              href="/booking"
              label="Book a Celebrity"
              icon="+"
            />
          </nav>

          {/* MEMBER FOOTER */}
          <div className="border-t border-white/10 p-4">

            <div className="mb-3 rounded-2xl bg-white/[0.06] p-4">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>

              <p className="mt-1 truncate text-xs text-white/40">
                {profile?.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {formatStatus(profile?.status || "active")}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* =========================================================
            MAIN
        ========================================================= */}
        <div className="min-w-0 flex-1">

          {/* =======================================================
              TOP BAR
          ======================================================= */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:h-20 sm:px-6 lg:px-10">

            {/* MOBILE LEFT */}
            <div className="flex items-center gap-3 lg:hidden">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((open) => !open)
                }
                className="relative z-[60] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#172033] shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                </span>
              </button>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-black tracking-tight"
              >
                CM<span className="text-blue-600">.</span>
              </Link>
            </div>

            {/* DESKTOP TITLE */}
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-[#172033]">
                Member Dashboard
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Your account overview
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* ⭐ VISIBLE MESSAGE BUTTON */}
              <Link
                href="/account/messages"
                className="group flex h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 sm:h-11 sm:px-4"
              >
                <span className="text-base">
                  ✉
                </span>

                <span className="hidden text-xs font-bold sm:inline">
                  Messages
                </span>
              </Link>

              {/* NOTIFICATION */}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:h-11 sm:w-11"
                aria-label="Notifications"
              >
                ♢
              </button>

              {/* PROFILE */}
              <Link
                href="/account/profile"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm sm:gap-3 sm:pr-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#172a4d] text-xs font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-sm font-semibold text-[#172033] sm:block">
                  {displayName}
                </span>
              </Link>
            </div>
          </header>

          {/* =======================================================
              MOBILE NAVIGATION
          ======================================================= */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[55] lg:hidden">

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 cursor-default bg-[#07101f]/50 backdrop-blur-[3px]"
              />

              <aside className="absolute left-0 top-0 flex h-full w-[84%] max-w-sm flex-col overflow-hidden bg-[#111a2e] text-white shadow-2xl">

                <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">

                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-black tracking-tight"
                  >
                    CM<span className="text-blue-400">.</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-white/70 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close navigation menu"
                  >
                    ×
                  </button>
                </div>

                {/* MEMBER INFO */}
                <div className="shrink-0 border-b border-white/10 px-5 py-5">

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
                    Member Portal
                  </p>

                  <div className="mt-4 flex items-center gap-3">

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-white/40">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MOBILE NAVIGATION */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">

                  <MobileSidebarLink
                    href="/account"
                    label="Dashboard"
                    icon="⌂"
                    active
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <MobileSidebarLink
                    href="/account/messages"
                    label="Messages"
                    icon="✉"
                    highlight
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <MobileSidebarLink
                    href="/account/bookings"
                    label="My Bookings"
                    icon="▣"
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <MobileSidebarLink
                    href="/fan-card/apply"
                    label="Membership"
                    icon="◇"
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <MobileSidebarLink
                    href="/account/profile"
                    label="Profile"
                    icon="○"
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <div className="my-5 border-t border-white/10" />

                  <MobileSidebarLink
                    href="/celebrities"
                    label="Browse Celebrities"
                    icon="☆"
                    onClick={() => setMobileMenuOpen(false)}
                  />

                  <MobileSidebarLink
                    href="/booking"
                    label="Book a Celebrity"
                    icon="+"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </nav>

                <div className="shrink-0 border-t border-white/10 p-4">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* =======================================================
              DASHBOARD CONTENT
          ======================================================= */}
          <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">

            {/* =====================================================
                HERO
            ===================================================== */}
            <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#14233f] via-[#172f58] to-[#2454a6] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-8 sm:py-10">

              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -right-8 -bottom-32 h-72 w-72 rounded-full border border-white/[0.07]" />

              <div className="relative max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Member Portal
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Welcome back, {displayName}.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                  Manage your membership, connect with Celebrity Management,
                  track bookings and access your member services.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    href="/account/messages"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-[#172a4d] shadow-sm transition hover:bg-blue-50"
                  >
                    <span>✉</span>
                    Open Messages
                  </Link>

                  <Link
                    href="/fan-card/apply"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    <span>◇</span>
                    Membership
                  </Link>
                </div>
              </div>
            </section>

            {/* =====================================================
                SUMMARY
            ===================================================== */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <DashboardStat
                label="Membership"
                value={
                  fanCard
                    ? formatStatus(fanCard.status)
                    : "Not Applied"
                }
                description={
                  fanCard
                    ? fanCard.membership_level
                    : "Apply for your fan card"
                }
                href="/fan-card/apply"
                accent="blue"
              />

              <DashboardStat
                label="Messages"
                value="Open"
                description="Contact management"
                href="/account/messages"
                accent="indigo"
                featured
              />

              <DashboardStat
                label="My Bookings"
                value={String(bookings.length)}
                description="Booking requests"
                href="/account/bookings"
                accent="slate"
              />

              <DashboardStat
                label="Account"
                value={
                  profile?.status === "active"
                    ? "Active"
                    : formatStatus(profile?.status || "active")
                }
                description="Membership account"
                href="/account/profile"
                accent="emerald"
              />
            </section>

            {/* =====================================================
                MAIN GRID
            ===================================================== */}
            <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">

              {/* FAN CARD */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                      Membership
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#172033]">
                      Membership Fan Card
                    </h2>
                  </div>

                  <Link
                    href="/fan-card/apply"
                    className="rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    {fanCard ? "View Card →" : "Apply →"}
                  </Link>
                </div>

                <div className="p-5 sm:p-6">

                  {fanCard ? (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#13223d] via-[#17345f] to-[#2460b8] p-6 text-white shadow-lg sm:p-8">

                      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />

                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10" />

                      <div className="relative">

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="text-lg font-black">
                              CM<span className="text-blue-300">.</span>
                            </p>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/40">
                              Celebrity Management
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase">
                            {fanCard.membership_level}
                          </span>
                        </div>

                        <div className="mt-12">

                          <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                            Member
                          </p>

                          <p className="mt-2 break-words text-xl font-bold">
                            {displayName}
                          </p>
                        </div>

                        <div className="mt-8 flex items-end justify-between gap-4">

                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                              Membership ID
                            </p>

                            <p className="mt-1 break-all font-mono text-sm">
                              {fanCard.membership_id}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                              Status
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {formatStatus(fanCard.status)}
                            </p>
                          </div>
                        </div>

                        {fanCard.expiry_date && (
                          <div className="mt-6 border-t border-white/10 pt-4">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                              Valid Until
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {formatDate(fanCard.expiry_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172a4d] text-xl text-white shadow-lg shadow-blue-900/10">
                        ◇
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-[#172033]">
                        No Membership Card Yet
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Apply for your official Celebrity Management
                        membership card and access your member benefits.
                      </p>

                      <Link
                        href="/fan-card/apply"
                        className="mt-5 inline-flex rounded-xl bg-[#172a4d] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#213b68]"
                      >
                        Apply for Fan Card
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* ⭐ PROMINENT MESSAGE CARD */}
                <Link
                  href="/account/messages"
                  className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-[#eaf2ff] to-[#f5f8ff] p-6 shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172a4d] text-xl text-white shadow-lg shadow-blue-900/10">
                      ✉
                    </div>

                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700 shadow-sm">
                      IMPORTANT
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-[#172033]">
                    Messages
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Communicate directly with the Celebrity Management
                    team about your membership, bookings and requests.
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-xs font-bold text-blue-700">
                      Open Messages
                    </span>

                    <span className="text-blue-500 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>

                {/* QUICK ACTIONS */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                      Quick Actions
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#172033]">
                      Member Services
                    </h2>
                  </div>

                  <div className="p-3">

                    <QuickAction
                      href="/booking"
                      title="Book a Celebrity"
                      description="Submit a new booking request"
                    />

                    <QuickAction
                      href="/fan-card/apply"
                      title="Membership"
                      description="Manage your membership card"
                    />

                    <QuickAction
                      href="/account/bookings"
                      title="My Bookings"
                      description="Track your requests"
                    />

                    <QuickAction
                      href="/account/profile"
                      title="Edit Profile"
                      description="Update your account information"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                BOOKINGS
            ===================================================== */}
            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                    Activity
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#172033]">
                    Recent Bookings
                  </h2>
                </div>

                <Link
                  href="/account/bookings"
                  className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  View All →
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="px-6 py-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    ▣
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#172033]">
                    No booking activity yet.
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Your booking requests will appear here.
                  </p>

                  <Link
                    href="/booking"
                    className="mt-5 inline-flex rounded-xl bg-[#172a4d] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#213b68]"
                  >
                    Book a Celebrity
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">

                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >

                      <div className="min-w-0">

                        <p className="text-sm font-bold text-[#172033]">
                          {booking.event_type}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {booking.booking_reference ||
                            "Booking request"}
                          {" · "}
                          {formatDate(booking.event_date)}
                        </p>

                        <p className="mt-1 break-words text-xs text-slate-400">
                          {booking.location}
                        </p>
                      </div>

                      <span className="w-fit shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">
                        {formatStatus(booking.booking_status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =====================================================
                FOOTER CARDS
            ===================================================== */}
            <section className="mt-6 grid gap-6 md:grid-cols-2">

              {/* ACCOUNT */}
              <div className="rounded-3xl bg-[#172a4d] p-6 text-white shadow-lg shadow-blue-900/10 sm:p-7">

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Account
                </p>

                <h2 className="mt-2 break-words text-xl font-bold">
                  {displayName}
                </h2>

                <p className="mt-2 break-all text-sm text-white/45">
                  {profile?.email}
                </p>

                <Link
                  href="/account/profile"
                  className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#172a4d] transition hover:bg-blue-50"
                >
                  Manage Profile
                </Link>
              </div>

              {/* SUPPORT */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Need Assistance?
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#172033]">
                  We're here to help.
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Contact our support team if you need help with your
                  membership or booking.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    href="/account/messages"
                    className="inline-flex rounded-xl bg-[#172a4d] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#213b68]"
                  >
                    Message Us
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-[#172033] transition hover:bg-slate-50"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===============================================================
   DESKTOP SIDEBAR LINK
=============================================================== */

function SidebarLink({
  href,
  label,
  icon,
  active = false,
  highlight = false,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-white text-[#172a4d] shadow-sm"
          : highlight
            ? "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-white"
            : "text-white/55 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span
        className={`flex w-5 justify-center text-sm ${
          highlight && !active ? "text-blue-400" : ""
        }`}
      >
        {icon}
      </span>

      {label}

      {highlight && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
      )}
    </Link>
  );
}

/* ===============================================================
   MOBILE SIDEBAR LINK
=============================================================== */

function MobileSidebarLink({
  href,
  label,
  icon,
  active = false,
  highlight = false,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
        active
          ? "bg-white text-[#172a4d]"
          : highlight
            ? "bg-blue-500/10 text-blue-300"
            : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span
        className={`flex w-5 justify-center text-sm ${
          highlight && !active ? "text-blue-400" : ""
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>

      {highlight && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
      )}
    </Link>
  );
}

/* ===============================================================
   DASHBOARD STAT
=============================================================== */

function DashboardStat({
  label,
  value,
  description,
  href,
  accent,
  featured = false,
}: {
  label: string;
  value: string;
  description: string;
  href: string;
  accent: "blue" | "indigo" | "slate" | "emerald";
  featured?: boolean;
}) {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        featured
          ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${accentClasses[accent]}`}
        >
          →
        </span>
      </div>

      <p className="mt-5 text-2xl font-black text-[#172033]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </Link>
  );
}

/* ===============================================================
   QUICK ACTION
=============================================================== */

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl p-4 transition hover:bg-blue-50"
    >
      <div className="min-w-0">

        <p className="text-sm font-bold text-[#172033]">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <span className="ml-4 shrink-0 text-blue-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
        →
      </span>
    </Link>
  );
}