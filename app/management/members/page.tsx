"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
};

const ROLE_OPTIONS = [
  "All",
  "member",
  "staff",
  "manager",
  "administrator",
  "super_admin",
];

const STATUS_OPTIONS = [
  "All",
  "active",
  "pending",
  "suspended",
  "deactivated",
];

export default function MembersPage() {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        display_name,
        email,
        phone,
        country,
        role,
        status,
        last_login_at,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("MEMBERS LOAD ERROR:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMembers(data || []);
    setLoading(false);
  }

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.full_name?.toLowerCase().includes(query) ||
        member.display_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || member.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (member) => member.status === "active"
  ).length;

  const pendingMembers = members.filter(
    (member) => member.status === "pending"
  ).length;

  const suspendedMembers = members.filter(
    (member) => member.status === "suspended"
  ).length;

  function formatDate(date: string | null) {
    if (!date) return "Never";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getInitials(member: Member) {
    const name =
      member.display_name ||
      member.full_name ||
      member.email ||
      "Member";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getDisplayName(member: Member) {
    return (
      member.display_name ||
      member.full_name ||
      member.email?.split("@")[0] ||
      "Member"
    );
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "suspended":
        return "bg-red-50 text-red-700 border-red-100";

      case "deactivated":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  }

  function getRoleClasses(role: string) {
    if (role === "super_admin") {
      return "bg-black text-white";
    }

    if (role === "administrator") {
      return "bg-purple-50 text-purple-700";
    }

    if (role === "manager") {
      return "bg-blue-50 text-blue-700";
    }

    if (role === "staff") {
      return "bg-indigo-50 text-indigo-700";
    }

    return "bg-gray-100 text-gray-600";
  }

  function formatRole(role: string) {
    return role
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-black">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-10">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/management"
                className="text-sm text-black/45 transition hover:text-black"
              >
                Management
              </Link>

              <span className="text-black/20">/</span>

              <span className="text-sm font-medium">
                Members
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Members
            </h1>

            <p className="mt-1 text-sm text-black/50">
              Manage registered members and account access.
            </p>
          </div>

          <Link
            href="/management"
            className="hidden rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-black/30 sm:block"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Members"
            value={totalMembers}
            description="Registered accounts"
          />

          <StatCard
            label="Active"
            value={activeMembers}
            description="Currently active"
          />

          <StatCard
            label="Pending"
            value={pendingMembers}
            description="Awaiting activation"
          />

          <StatCard
            label="Suspended"
            value={suspendedMembers}
            description="Restricted accounts"
          />
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black/30 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-black/30"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role === "All" ? "All roles" : formatRole(role)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-black/30"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "All"
                      ? "All statuses"
                      : formatRole(status)}
                  </option>
                ))}
              </select>

              <button
                onClick={loadMembers}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">
              Could not load members
            </p>

            <p className="mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Table */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-5 py-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Member Directory
                </h2>

                <p className="mt-1 text-sm text-black/45">
                  Showing {filteredMembers.length} of{" "}
                  {members.length} members
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-black/5"
                />
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                <svg
                  className="h-6 w-6 text-black/35"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No members found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-black/45">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#fafaf8] text-left text-xs uppercase tracking-[0.14em] text-black/40">
                      <th className="px-5 py-4 font-medium">
                        Member
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Contact
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Role
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Joined
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Last Login
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-black/5 last:border-0 transition hover:bg-black/[0.015]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                              {getInitials(member)}
                            </div>

                            <div>
                              <p className="font-medium">
                                {getDisplayName(member)}
                              </p>

                              {member.display_name &&
                                member.full_name &&
                                member.display_name !==
                                  member.full_name && (
                                  <p className="mt-0.5 text-xs text-black/40">
                                    {member.full_name}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm">
                            {member.email || "—"}
                          </p>

                          <p className="mt-1 text-xs text-black/40">
                            {member.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleClasses(
                              member.role
                            )}`}
                          >
                            {formatRole(member.role)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                              member.status
                            )}`}
                          >
                            {member.status}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm text-black/60">
                          {formatDate(member.created_at)}
                        </td>

                        <td className="px-5 py-5 text-sm text-black/60">
                          {formatDate(member.last_login_at)}
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/management/members/${member.id}`}
                            className="inline-flex rounded-lg border border-black/10 px-3 py-2 text-xs font-medium transition hover:border-black/30 hover:bg-black hover:text-white"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-black/5 lg:hidden">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                          {getInitials(member)}
                        </div>

                        <div>
                          <p className="font-medium">
                            {getDisplayName(member)}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {member.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/management/members/${member.id}`}
                        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium"
                      >
                        View
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleClasses(
                          member.role
                        )}`}
                      >
                        {formatRole(member.role)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-black/40">
                          Phone
                        </p>

                        <p className="mt-1">
                          {member.phone || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-black/40">
                          Joined
                        </p>

                        <p className="mt-1">
                          {formatDate(member.created_at)}
                        </p>
                      </div>
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
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm text-black/45">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight">
          {value.toLocaleString()}
        </p>

        <span className="text-xs text-black/35">
          {description}
        </span>
      </div>
    </div>
  );
}