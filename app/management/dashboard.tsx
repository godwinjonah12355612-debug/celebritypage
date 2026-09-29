"use client";

import NextLink from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { createClient } from "@/lib/supabase/client";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} prefetch={false} />;
}
type DashboardProfile = {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  role: string | null;
};

type DashboardProps = {
  userId: string;
  profile: DashboardProfile;
};

type DashboardData = {
  totalMembers: number;
  activeMembers: number;

  totalCelebrities: number;
  activeCelebrities: number;

  pendingFanCards: number;
  activeFanCards: number;

  bookingRequests: number;
  underReviewBookings: number;
  quoteSentBookings: number;
  awaitingPaymentBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalBookings: number;

  unreadMessages: number;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  type: "Booking" | "Fan Card" | "Member" | "Talent" | "Message";
  date: string;
};

const EMPTY_DATA: DashboardData = {
  totalMembers: 0,
  activeMembers: 0,

  totalCelebrities: 0,
  activeCelebrities: 0,

  pendingFanCards: 0,
  activeFanCards: 0,

  bookingRequests: 0,
  underReviewBookings: 0,
  quoteSentBookings: 0,
  awaitingPaymentBookings: 0,
  confirmedBookings: 0,
  completedBookings: 0,
  totalBookings: 0,

  unreadMessages: 0,
};

export default function Dashboard({
  userId,
  profile,
}: DashboardProps) {
  const supabase = useMemo(() => createClient(), []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  async function loadDashboard(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        totalMembersResult,
        activeMembersResult,

        totalCelebritiesResult,
        activeCelebritiesResult,

        pendingFanCardsResult,
        activeFanCardsResult,

        bookingRequestsResult,
        underReviewResult,
        quoteSentResult,
        awaitingPaymentResult,
        confirmedBookingsResult,
        completedBookingsResult,
        totalBookingsResult,

        unreadMessagesResult,
      ] = await Promise.all([
        // MEMBERS
        supabase
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "active"),

        // CELEBRITIES
        supabase
          .from("celebrities")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("celebrities")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("management_status", "active"),

        // FAN CARDS
        supabase
          .from("fan_cards")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending"),

        supabase
          .from("fan_cards")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "active"),

        // BOOKINGS
        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "request"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "under_review"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "quote_sent"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "awaiting_payment"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "confirmed"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("booking_status", "event_completed"),

        supabase
          .from("bookings")
          .select("id", {
            count: "exact",
            head: true,
          }),

        // MESSAGES
        supabase
          .from("messages")
          .select("id", {
            count: "exact",
            head: true,
          })
          .is("read_at", null)
          .neq("sender_id", userId),
      ]);

      setData({
        totalMembers: totalMembersResult.count ?? 0,
        activeMembers: activeMembersResult.count ?? 0,

        totalCelebrities: totalCelebritiesResult.count ?? 0,
        activeCelebrities: activeCelebritiesResult.count ?? 0,

        pendingFanCards: pendingFanCardsResult.count ?? 0,
        activeFanCards: activeFanCardsResult.count ?? 0,

        bookingRequests: bookingRequestsResult.count ?? 0,
        underReviewBookings: underReviewResult.count ?? 0,
        quoteSentBookings: quoteSentResult.count ?? 0,
        awaitingPaymentBookings:
          awaitingPaymentResult.count ?? 0,
        confirmedBookings:
          confirmedBookingsResult.count ?? 0,
        completedBookings:
          completedBookingsResult.count ?? 0,
        totalBookings:
          totalBookingsResult.count ?? 0,

        unreadMessages:
          unreadMessagesResult.count ?? 0,
      });

      await loadActivity();
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadActivity() {
    const [
      bookingsResult,
      fanCardsResult,
      membersResult,
      celebritiesResult,
      messagesResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, booking_reference, event_type, booking_status, created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5),

      supabase
        .from("fan_cards")
        .select(
          "id, membership_id, membership_level, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5),

      supabase
        .from("profiles")
        .select(
          "id, full_name, display_name, email, created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5),

      supabase
        .from("celebrities")
        .select(
          "id, name, created_at, updated_at"
        )
        .order("updated_at", {
          ascending: false,
        })
        .limit(5),

      supabase
        .from("messages")
        .select("id, message, created_at")
        .order("created_at", {
          ascending: false,
        })
        .limit(5),
    ]);

    const items: ActivityItem[] = [];

    for (const booking of bookingsResult.data ?? []) {
      items.push({
        id: `booking-${booking.id}`,
        title: "Booking activity",
        description:
          booking.booking_reference ||
          booking.event_type ||
          "Booking request",
        type: "Booking",
        date: booking.created_at,
      });
    }

    for (const card of fanCardsResult.data ?? []) {
      items.push({
        id: `card-${card.id}`,
        title: "Fan card application",
        description: `${card.membership_id} · ${formatLabel(
          card.status
        )}`,
        type: "Fan Card",
        date: card.created_at,
      });
    }

    for (const member of membersResult.data ?? []) {
      items.push({
        id: `member-${member.id}`,
        title: "New member registered",
        description:
          member.display_name ||
          member.full_name ||
          member.email ||
          "New member",
        type: "Member",
        date: member.created_at,
      });
    }

    for (const celebrity of celebritiesResult.data ?? []) {
      items.push({
        id: `celebrity-${celebrity.id}`,
        title: "Celebrity profile updated",
        description: celebrity.name,
        type: "Talent",
        date:
          celebrity.updated_at ||
          celebrity.created_at,
      });
    }

    for (const message of messagesResult.data ?? []) {
      items.push({
        id: `message-${message.id}`,
        title: "New message",
        description: truncate(
          message.message || "New message",
          70
        ),
        type: "Message",
        date: message.created_at,
      });
    }

    items.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    setActivities(items.slice(0, 8));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const displayName =
    profile.display_name ||
    profile.full_name ||
    profile.email?.split("@")[0] ||
    "Administrator";

  const roleLabel = formatLabel(
    profile.role || "management"
  );

  const pendingWork =
    data.pendingFanCards +
    data.bookingRequests +
    data.underReviewBookings +
    data.awaitingPaymentBookings +
    data.unreadMessages;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb]">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 bg-[#0b1220] lg:block" />

          <section className="flex-1 p-6 lg:p-10">
            <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
              <div className="h-[450px] animate-pulse rounded-2xl bg-white" />
              <div className="h-[450px] animate-pulse rounded-2xl bg-[#0b1220]" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#172033]">
      <div className="flex min-h-screen">

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-[#07101f]/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1220] text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* BRAND */}
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <Link
              href="/management"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#d7b85a] to-[#a77b16] text-sm font-bold text-[#101827] shadow-lg shadow-black/20">
                CM
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide">
                  Celebrity Management
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-blue-200/40">
                  Management Portal
                </p>
              </div>
            </Link>
          </div>

          {/* PROFILE */}
          <div className="border-b border-white/10 p-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold shadow-lg">
                  {getInitials(displayName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {displayName}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <p className="text-xs text-white/45">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
              Overview
            </p>

            <div className="space-y-1">
              <SidebarLink
                href="/management"
                label="Dashboard"
                icon="⌂"
                active
              />

              <SidebarLink
                href="/management/celebrities"
                label="Celebrities"
                icon="★"
              />

              <SidebarLink
                href="/management/members"
                label="Members"
                icon="◎"
              />

              <SidebarLink
                href="/management/fan-cards"
                label="Fan Cards"
                icon="◇"
                badge={data.pendingFanCards}
              />

              <SidebarLink
                href="/management/bookings"
                label="Bookings"
                icon="□"
                badge={
                  data.bookingRequests +
                  data.underReviewBookings
                }
              />

              <SidebarLink
                href="/management/events"
                label="Events"
                icon="◷"
              />

             <a
  href="/management/messages"
  className="block"
>
  <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
    <div className="flex items-center gap-3">
      <span className="text-sm">○</span>
      <span>Messages</span>
    </div>

    {data.unreadMessages > 0 && (
      <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
        {data.unreadMessages}
      </span>
    )}
  </div>
</a>
            </div>

            <p className="px-3 pb-3 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
              Account
            </p>

            <div className="space-y-1">
              <SidebarLink
                href="/management/profile"
                label="My Profile"
                icon="●"
              />
            </div>
          </nav>

          {/* SIDEBAR FOOTER */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />

                <p className="text-[11px] font-medium text-white/70">
                  System operational
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-[#f4f7fb]/95 px-5 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              >
                ☰
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Management
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Dashboard Overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* MESSAGE BUTTON */}
              <Link
                href="/management/messages"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
              >
                ○

                {data.unreadMessages > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Link>

              {/* PROFILE */}
              <Link
                href="/management/profile"
                className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition hover:border-blue-200 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                  {getInitials(displayName)}
                </div>

                <div>
                  <p className="max-w-32 truncate text-xs font-semibold text-slate-800">
                    {displayName}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {roleLabel}
                  </p>
                </div>
              </Link>
            </div>
          </header>

          <div className="p-5 sm:p-6 lg:p-10">

            {/* WELCOME */}
            <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                    {formatToday()}
                  </p>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">
                  Welcome back,{" "}
                  <span className="text-blue-600">
                    {firstName(displayName)}.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Here is the current overview of your
                  celebrity management platform.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex w-fit items-center gap-2 rounded-xl bg-[#0b1220] px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={refreshing ? "animate-spin" : ""}>
                  ↻
                </span>

                {refreshing
                  ? "Refreshing..."
                  : "Refresh data"}
              </button>
            </section>

            {/* MAIN STATS */}
            <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Total Members"
                value={data.totalMembers}
                secondary={`${data.activeMembers} active members`}
                href="/management/members"
                icon="◎"
                iconStyle="blue"
              />

              <StatCard
                label="Celebrities"
                value={data.totalCelebrities}
                secondary={`${data.activeCelebrities} active profiles`}
                href="/management/celebrities"
                icon="★"
                iconStyle="purple"
              />

              <StatCard
                label="Pending Fan Cards"
                value={data.pendingFanCards}
                secondary={`${data.activeFanCards} active cards`}
                href="/management/fan-cards"
                icon="◇"
                iconStyle="gold"
                highlight={data.pendingFanCards > 0}
              />

              <StatCard
                label="Booking Requests"
                value={data.bookingRequests}
                secondary={`${data.confirmedBookings} confirmed`}
                href="/management/bookings"
                icon="□"
                iconStyle="green"
                highlight={data.bookingRequests > 0}
              />
            </section>

            {/* SECONDARY STATS */}
            <section className="mt-5 grid gap-4 sm:grid-cols-3">
              <MiniStat
                label="Total bookings"
                value={data.totalBookings}
                href="/management/bookings"
                color="blue"
              />

              <MiniStat
                label="Completed bookings"
                value={data.completedBookings}
                href="/management/bookings"
                color="green"
              />

              <MiniStat
                label="Unread messages"
                value={data.unreadMessages}
                href="/management/messages"
                color="purple"
              />
            </section>

            {/* ACTIVITY + QUICK ACTIONS */}
            <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">

              {/* ACTIVITY */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                        Platform activity
                      </p>

                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        Recent activity
                      </h2>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      ◷
                    </div>
                  </div>
                </div>

                {activities.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      ◷
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-800">
                      No activity yet
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      New platform activity will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 px-6 py-5 transition hover:bg-slate-50"
                      >
                        <ActivityIcon type={activity.type} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <p className="text-sm font-semibold text-slate-800">
                              {activity.title}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {formatRelativeTime(
                                activity.date
                              )}
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {activity.description}
                          </p>

                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS */}
              <div className="relative overflow-hidden rounded-2xl bg-[#0b1220] p-6 text-white shadow-xl">
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />

                <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-indigo-600/20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d7b85a]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">
                      Quick actions
                    </p>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold">
                    Manage your platform
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Access the most frequently used management
                    tools.
                  </p>

                  <div className="mt-7 space-y-2">
                    <QuickAction
                      href="/management/celebrities"
                      title="Manage Celebrities"
                      description="Profiles, photos and availability"
                      icon="★"
                    />

                    <QuickAction
                      href="/management/bookings"
                      title="Review Bookings"
                      description={`${data.bookingRequests} requests waiting`}
                      icon="□"
                    />

                    <QuickAction
                      href="/management/fan-cards"
                      title="Review Fan Cards"
                      description={`${data.pendingFanCards} applications waiting`}
                      icon="◇"
                    />

                    <QuickAction
                      href="/management/messages"
                      title="Open Messages"
                      description={`${data.unreadMessages} unread messages`}
                      icon="○"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* PIPELINE */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* BOOKINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                      Bookings
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900">
                      Booking pipeline
                    </h3>
                  </div>

                  <Link
                    href="/management/bookings"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    View all →
                  </Link>
                </div>

                <div className="mt-7 space-y-4">
                  <PipelineRow
                    label="Requests"
                    value={data.bookingRequests}
                    color="blue"
                  />

                  <PipelineRow
                    label="Under review"
                    value={data.underReviewBookings}
                    color="purple"
                  />

                  <PipelineRow
                    label="Quote sent"
                    value={data.quoteSentBookings}
                    color="gold"
                  />

                  <PipelineRow
                    label="Awaiting payment"
                    value={data.awaitingPaymentBookings}
                    color="orange"
                  />

                  <PipelineRow
                    label="Confirmed"
                    value={data.confirmedBookings}
                    color="green"
                  />

                  <PipelineRow
                    label="Completed"
                    value={data.completedBookings}
                    color="slate"
                  />
                </div>
              </div>

              {/* FAN CARDS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a24]">
                      Membership
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900">
                      Fan cards
                    </h3>
                  </div>

                  <Link
                    href="/management/fan-cards"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-[#a07816] transition hover:bg-[#fbf7e8]"
                  >
                    View all →
                  </Link>
                </div>

                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-slate-900">
                      {data.activeFanCards}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Active cards
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#b18a24]">
                      {data.pendingFanCards}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Pending
                    </p>
                  </div>
                </div>

                <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a77b16] to-[#d7b85a] transition-all"
                    style={{
                      width:
                        data.activeFanCards +
                          data.pendingFanCards >
                        0
                          ? `${
                              (data.activeFanCards /
                                (data.activeFanCards +
                                  data.pendingFanCards)) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                  <span>Active</span>

                  <span>
                    {data.activeFanCards +
                      data.pendingFanCards >
                    0
                      ? Math.round(
                          (data.activeFanCards /
                            (data.activeFanCards +
                              data.pendingFanCards)) *
                            100
                        )
                      : 0}
                    % active
                  </span>
                </div>
              </div>
            </section>

            {/* SYSTEM */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                    Platform
                  </p>

                  <h3 className="mt-2 font-bold text-slate-900">
                    System overview
                  </h3>
                </div>

                <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 sm:block">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-[10px] font-bold text-emerald-700">
                      Operational
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SystemRow
                  label="Authentication"
                  status="Connected"
                />

                <SystemRow
                  label="Database"
                  status="Connected"
                />

                <SystemRow
                  label="Celebrity management"
                  status="Connected"
                />

                <SystemRow
                  label="Fan cards"
                  status="Connected"
                />

                <SystemRow
                  label="Bookings"
                  status="Connected"
                />

                <SystemRow
                  label="Messaging"
                  status="Connected"
                />
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-4">
                <p className="text-xs text-slate-500">
                  {pendingWork > 0
                    ? `${pendingWork} items currently need attention.`
                    : "Nothing currently requires attention."}
                </p>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex flex-col justify-between gap-3 text-[11px] text-slate-400 sm:flex-row">
                <p>
                  Celebrity Management Platform
                </p>

                <p>
                  Live data from Supabase
                </p>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SIDEBAR                                                                    */
/* -------------------------------------------------------------------------- */

function SidebarLink({
  href,
  label,
  icon,
  badge,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
          : "text-white/55 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition ${
          active
            ? "bg-white/15 text-white"
            : "bg-white/[0.05] text-white/40 group-hover:bg-white/10 group-hover:text-white"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {badge !== undefined && badge > 0 && (
        <span
          className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[9px] font-bold ${
            active
              ? "bg-white text-blue-700"
              : "bg-red-500 text-white"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  secondary,
  href,
  icon,
  iconStyle,
  highlight = false,
}: {
  label: string;
  value: number;
  secondary: string;
  href: string;
  icon: string;
  iconStyle:
    | "blue"
    | "purple"
    | "gold"
    | "green";
  highlight?: boolean;
}) {
  const iconStyles = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-indigo-50 text-indigo-600",
    gold: "bg-[#fbf7e8] text-[#ad821c]",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${iconStyles[iconStyle]}`}
        >
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:text-blue-500">
          →
        </span>
      </div>

      <p className="mt-7 text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {value.toLocaleString()}
        </p>

        {highlight && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-700">
            Action
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        {secondary}
      </p>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${
          iconStyle === "gold"
            ? "bg-gradient-to-r from-[#a77b16] to-[#d7b85a]"
            : iconStyle === "purple"
            ? "bg-indigo-500"
            : iconStyle === "green"
            ? "bg-emerald-500"
            : "bg-blue-600"
        }`}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI STAT                                                                  */
/* -------------------------------------------------------------------------- */

function MiniStat({
  label,
  value,
  href,
  color,
}: {
  label: string;
  value: number;
  href: string;
  color: "blue" | "green" | "purple";
}) {
  const dotStyles = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    purple: "bg-indigo-500",
  };

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${dotStyles[color]}`}
        />
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* QUICK ACTION                                                               */
/* -------------------------------------------------------------------------- */

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-blue-400/20 hover:bg-blue-500/10"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1220]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-white/40">
          {description}
        </p>
      </div>

      <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-blue-300">
        →
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* PIPELINE                                                                   */
/* -------------------------------------------------------------------------- */

function PipelineRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color:
    | "blue"
    | "purple"
    | "gold"
    | "orange"
    | "green"
    | "slate";
}) {
  const colors = {
    blue: "bg-blue-500",
    purple: "bg-indigo-500",
    gold: "bg-[#c49a32]",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
    slate: "bg-slate-400",
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${colors[color]}`}
        />

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-800">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SYSTEM ROW                                                                 */
/* -------------------------------------------------------------------------- */

function SystemRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

        {status}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ACTIVITY ICON                                                              */
/* -------------------------------------------------------------------------- */

function ActivityIcon({
  type,
}: {
  type: ActivityItem["type"];
}) {
  const icons: Record<
    ActivityItem["type"],
    string
  > = {
    Booking: "□",
    "Fan Card": "◇",
    Member: "◎",
    Talent: "★",
    Message: "○",
  };

  const styles: Record<
    ActivityItem["type"],
    string
  > = {
    Booking:
      "bg-blue-50 text-blue-600",
    "Fan Card":
      "bg-[#fbf7e8] text-[#a77b16]",
    Member:
      "bg-indigo-50 text-indigo-600",
    Talent:
      "bg-purple-50 text-purple-600",
    Message:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${styles[type]}`}
    >
      {icons[type]}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function firstName(name: string) {
  return (
    name.trim().split(/\s+/)[0] ||
    "there"
  );
}

function truncate(
  value: string,
  length: number
) {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}...`;
}

function formatToday() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date());
}

function formatRelativeTime(date: string) {
  const difference = Math.max(
    0,
    Date.now() -
      new Date(date).getTime()
  );

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}