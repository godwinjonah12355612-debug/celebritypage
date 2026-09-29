"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type FanCardStatus =
  | "pending"
  | "approved"
  | "active"
  | "expired"
  | "rejected"
  | "cancelled";

type MembershipLevel =
  | "standard"
  | "premium"
  | "vip"
  | "elite";

type Member = {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
};

type FanCard = {
  id: string;
  member_id: string;
  membership_id: string;
  membership_level: MembershipLevel;
  status: FanCardStatus;
  issue_date: string | null;
  expiry_date: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  qr_token: string | null;
  notes: string | null;
  created_at: string;
  member: Member[] | null;
};

const STATUS_OPTIONS: Array<"all" | FanCardStatus> = [
  "all",
  "pending",
  "approved",
  "active",
  "expired",
  "rejected",
  "cancelled",
];

const LEVEL_OPTIONS: Array<"all" | MembershipLevel> = [
  "all",
  "standard",
  "premium",
  "vip",
  "elite",
];

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getMember(card: FanCard) {
  return card.member?.[0] || null;
}

function getMemberName(card: FanCard) {
  const member = getMember(card);

  return (
    member?.display_name ||
    member?.full_name ||
    member?.email?.split("@")[0] ||
    "Unknown Member"
  );
}

function getMemberEmail(card: FanCard) {
  return getMember(card)?.email || "No email";
}

function statusClasses(status: FanCardStatus) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "approved":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "expired":
      return "border-gray-200 bg-gray-100 text-gray-600";

    case "cancelled":
      return "border-gray-200 bg-gray-100 text-gray-600";

    default:
      return "border-gray-200 bg-gray-100 text-gray-600";
  }
}

function levelClasses(level: MembershipLevel) {
  switch (level) {
    case "elite":
      return "bg-black text-white";

    case "vip":
      return "bg-zinc-900 text-white";

    case "premium":
      return "bg-zinc-200 text-zinc-800";

    case "standard":
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ManagementFanCardsPage() {
  const supabase = createClient();

  const [cards, setCards] = useState<FanCard[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [deletingId, setDeletingId] = useState<string | null>(null);
const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | FanCardStatus>("all");

  const [levelFilter, setLevelFilter] =
    useState<"all" | MembershipLevel>("all");

  async function loadFanCards(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    const { data, error } = await supabase
      .from("fan_cards")
      .select(`
        id,
        member_id,
        membership_id,
        membership_level,
        status,
        issue_date,
        expiry_date,
        approved_at,
        rejection_reason,
        qr_token,
        notes,
        created_at,
        member:profiles!fan_cards_member_id_fkey(
          full_name,
          display_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FAN CARDS LOAD ERROR:", error);

      setErrorMessage(error.message);
      setCards([]);
    } else {
      setCards((data || []) as FanCard[]);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadFanCards();
  }, []);
  async function handleDeleteCard(cardId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this fan card?"
  );

  if (!confirmed) return;

  setDeletingId(cardId);
  setErrorMessage("");

  const { error } = await supabase
    .from("fan_cards")
    .delete()
    .eq("id", cardId);

  if (error) {
    console.error("DELETE FAN CARD ERROR:", error);
    setErrorMessage("We could not delete this fan card.");
    setDeletingId(null);
    return;
  }

  setCards((current) =>
    current.filter((card) => card.id !== cardId)
  );

  setDeletingId(null);
}

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cards.filter((card) => {
      const member = getMember(card);

      const matchesSearch =
        !query ||
        card.membership_id.toLowerCase().includes(query) ||
        member?.full_name?.toLowerCase().includes(query) ||
        member?.display_name?.toLowerCase().includes(query) ||
        member?.email?.toLowerCase().includes(query) ||
        member?.phone?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        card.status === statusFilter;

      const matchesLevel =
        levelFilter === "all" ||
        card.membership_level === levelFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLevel
      );
    });
  }, [cards, search, statusFilter, levelFilter]);

  const totalCards = cards.length;

  const pendingCards = cards.filter(
    (card) => card.status === "pending"
  ).length;

  const activeCards = cards.filter(
    (card) => card.status === "active"
  ).length;

  const expiredCards = cards.filter(
    (card) => card.status === "expired"
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-black">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/management"
                className="text-sm font-medium text-gray-500 transition hover:text-black"
              >
                ← Management Dashboard
              </Link>

              <div className="mt-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Fan Cards
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Review, approve and manage member fan cards.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadFanCards(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-semibold">
              Could not load fan cards
            </p>

            <p className="mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Cards"
            value={totalCards}
            description="All applications"
          />

          <StatCard
            label="Pending"
            value={pendingCards}
            description="Awaiting review"
          />

          <StatCard
            label="Active"
            value={activeCards}
            description="Currently active"
          />

          <StatCard
            label="Expired"
            value={expiredCards}
            description="Expired memberships"
          />
        </div>

        {/* FILTERS */}
        <section className="mt-8 rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member, email or membership ID..."
                className="w-full rounded-xl border border-black/10 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | FanCardStatus
                )
              }
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  Status:{" "}
                  {status === "all"
                    ? "All"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) =>
                setLevelFilter(
                  e.target.value as
                    | "all"
                    | MembershipLevel
                )
              }
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  Level:{" "}
                  {level === "all"
                    ? "All"
                    : level.charAt(0).toUpperCase() +
                      level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredCards.length} of{" "}
              {cards.length} cards
            </span>

            {(search ||
              statusFilter !== "all" ||
              levelFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setLevelFilter("all");
                }}
                className="font-semibold text-black underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-6">
          {loading ? (
            <LoadingState />
          ) : filteredCards.length === 0 ? (
            <EmptyState
              hasCards={cards.length > 0}
              search={search}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-hidden rounded-3xl border border-black/10 bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-black/10 bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Member
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Membership ID
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Level
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Valid Until
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCards.map((card) => (
                        <tr
                          key={card.id}
                          className="border-b border-black/5 last:border-0 hover:bg-gray-50/70"
                        >
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {getMemberName(card)}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {getMemberEmail(card)}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="font-mono text-sm font-semibold">
                              {card.membership_id}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${levelClasses(
                                card.membership_level
                              )}`}
                            >
                              {card.membership_level}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                                card.status
                              )}`}
                            >
                              {card.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {formatDate(card.expiry_date)}
                          </td>

                          
                          <td className="px-6 py-5 text-right">
  <div className="flex justify-end gap-2">
    <Link
      href={`/management/fan-cards/${card.id}`}
      className="inline-flex rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
    >
      Review
    </Link>

    <button
      type="button"
      onClick={() => handleDeleteCard(card.id)}
      disabled={deletingId === card.id}
      className="inline-flex rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deletingId === card.id ? "Deleting..." : "Delete"}
    </button>
  </div>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-4 md:hidden">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-3xl border border-black/10 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {getMemberName(card)}
                        </h3>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {getMemberEmail(card)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClasses(
                          card.status
                        )}`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Membership ID
                      </p>

                      <p className="mt-1 font-mono text-sm font-semibold">
                        {card.membership_id}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Level
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${levelClasses(
                            card.membership_level
                          )}`}
                        >
                          {card.membership_level}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Valid Until
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(card.expiry_date)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
  <Link
    href={`/management/fan-cards/${card.id}`}
    className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
  >
    Review Fan Card
  </Link>

  <button
    type="button"
    onClick={() => handleDeleteCard(card.id)}
    disabled={deletingId === card.id}
    className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingId === card.id ? "Deleting..." : "Delete"}
  </button>
</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-black/10 bg-white md:block">
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-6 border-b border-black/5 px-6 py-6 last:border-0"
            >
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-3xl bg-white"
          />
        ))}
      </div>
    </>
  );
}

function EmptyState({
  hasCards,
  search,
}: {
  hasCards: boolean;
  search: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        ◇
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {hasCards
          ? "No matching fan cards"
          : "No fan cards yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {hasCards && search
          ? "Try a different member name, email address or membership ID."
          : "Fan card applications will appear here when members submit them."}
      </p>
    </div>
  );
}