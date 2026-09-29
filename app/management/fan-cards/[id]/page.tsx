"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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

type FanCard = {
  id: string;
  member_id: string;
  membership_id: string;
  membership_level: MembershipLevel;
  status: FanCardStatus;
  issue_date: string | null;
  expiry_date: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  qr_token: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Member = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
};

const STATUS_OPTIONS: FanCardStatus[] = [
  "pending",
  "approved",
  "active",
  "expired",
  "rejected",
  "cancelled",
];

const MEMBERSHIP_LEVELS: MembershipLevel[] = [
  "standard",
  "premium",
  "vip",
  "elite",
];

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function oneYearFromToday() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);

  return date.toISOString().split("T")[0];
}

function getLevelLabel(level: MembershipLevel) {
  return level.toUpperCase();
}

function getMemberLevelText(level: MembershipLevel) {
  return `${level.toUpperCase()} MEMBER`;
}

function getStatusText(status: FanCardStatus) {
  return status.toUpperCase();
}

export default function FanCardDetailsPage() {
  const params = useParams();
  const supabase = createClient();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [card, setCard] = useState<FanCard | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] =
    useState<FanCardStatus>("pending");

  const [membershipLevel, setMembershipLevel] =
    useState<MembershipLevel>("standard");

  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCard() {
    if (!id) return;

    setLoading(true);
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
        approved_by,
        rejection_reason,
        qr_token,
        notes,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("FAN CARD ERROR:", error);

      setErrorMessage(
        error?.message || "Fan card not found."
      );

      setLoading(false);
      return;
    }

    const fanCard = data as FanCard;

    setCard(fanCard);
    setStatus(fanCard.status);
    setMembershipLevel(fanCard.membership_level);
    setIssueDate(fanCard.issue_date || "");
    setExpiryDate(fanCard.expiry_date || "");
    setRejectionReason(
      fanCard.rejection_reason || ""
    );
    setNotes(fanCard.notes || "");

    const {
      data: memberData,
      error: memberError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        display_name,
        email,
        phone,
        country,
        avatar_url,
        role,
        status
      `)
      .eq("id", fanCard.member_id)
      .single();

    if (memberError) {
      console.error(
        "MEMBER PROFILE ERROR:",
        memberError
      );
    }

    if (memberData) {
      setMember(memberData as Member);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCard();
  }, [id]);

  async function saveChanges() {
    if (!card) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {
      setErrorMessage(
        "Your management session has expired."
      );
      setSaving(false);
      return;
    }

    const updateData: Record<string, unknown> = {
      status,
      membership_level: membershipLevel,
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      rejection_reason:
        status === "rejected"
          ? rejectionReason.trim() || null
          : null,
      notes: notes.trim() || null,
    };

    if (
      (status === "approved" ||
        status === "active") &&
      !card.approved_at
    ) {
      updateData.approved_at =
        new Date().toISOString();

      updateData.approved_by =
        authData.user.id;
    }

    const { data, error } = await supabase
      .from("fan_cards")
      .update(updateData)
      .eq("id", card.id)
      .select()
      .single();

    if (error) {
      console.error(
        "SAVE FAN CARD ERROR:",
        error
      );

      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCard(data as FanCard);

    setMessage(
      "Fan card changes saved successfully."
    );

    setSaving(false);
  }

  async function approveCard() {
    if (!card) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {
      setErrorMessage(
        "Your management session has expired."
      );
      setSaving(false);
      return;
    }

    const finalIssueDate =
      issueDate || today();

    const finalExpiryDate =
      expiryDate || oneYearFromToday();

    const { data, error } = await supabase
      .from("fan_cards")
      .update({
        status: "approved",
        membership_level: membershipLevel,
        issue_date: finalIssueDate,
        expiry_date: finalExpiryDate,
        approved_at:
          new Date().toISOString(),
        approved_by: authData.user.id,
        rejection_reason: null,
      })
      .eq("id", card.id)
      .select()
      .single();

    if (error) {
      console.error("APPROVE ERROR:", error);

      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCard(data as FanCard);
    setStatus("approved");
    setIssueDate(finalIssueDate);
    setExpiryDate(finalExpiryDate);
    setRejectionReason("");

    setMessage(
      "Fan card application approved."
    );

    setSaving(false);
  }

  async function rejectCard() {
    if (!card) return;

    if (!rejectionReason.trim()) {
      setErrorMessage(
        "Please enter a rejection reason first."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("fan_cards")
      .update({
        status: "rejected",
        rejection_reason:
          rejectionReason.trim(),
      })
      .eq("id", card.id)
      .select()
      .single();

    if (error) {
      console.error("REJECT ERROR:", error);

      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCard(data as FanCard);
    setStatus("rejected");

    setMessage(
      "Fan card application rejected."
    );

    setSaving(false);
  }

  async function activateCard() {
    if (!card) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const finalIssueDate =
      issueDate || today();

    const finalExpiryDate =
      expiryDate || oneYearFromToday();

    const { data, error } = await supabase
      .from("fan_cards")
      .update({
        status: "active",
        issue_date: finalIssueDate,
        expiry_date: finalExpiryDate,
      })
      .eq("id", card.id)
      .select()
      .single();

    if (error) {
      console.error("ACTIVATE ERROR:", error);

      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCard(data as FanCard);
    setStatus("active");
    setIssueDate(finalIssueDate);
    setExpiryDate(finalExpiryDate);

    setMessage(
      "Fan card is now active."
    );

    setSaving(false);
  }

  async function cancelCard() {
    if (!card) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this fan card?"
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("fan_cards")
      .update({
        status: "cancelled",
      })
      .eq("id", card.id)
      .select()
      .single();

    if (error) {
      console.error("CANCEL ERROR:", error);

      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCard(data as FanCard);
    setStatus("cancelled");

    setMessage(
      "Fan card has been cancelled."
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f0]">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[650px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[500px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#f3f3f0] px-5 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
            !
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Fan Card Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {errorMessage ||
              "This fan card could not be found."}
          </p>

          <Link
            href="/management/fan-cards"
            className="mt-7 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Fan Cards
          </Link>
        </div>
      </div>
    );
  }

  const memberName =
    member?.display_name ||
    member?.full_name ||
    member?.email?.split("@")[0] ||
    "Unknown Member";

  const qrValue =
    card.qr_token ||
    card.membership_id;

  return (
    <div className="min-h-screen bg-[#f3f3f0] text-black">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6">
          <Link
            href="/management/fan-cards"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Fan Cards
          </Link>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Fan Card Review
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Membership ID:{" "}
                <span className="font-mono font-semibold text-black">
                  {card.membership_id}
                </span>
              </p>
            </div>

            <span className="w-fit rounded-full border border-black/10 bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
              {card.status}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* =====================================================
              LEFT — FAN CARD
          ====================================================== */}
          <div>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Official Membership
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Card Preview
                  </h2>
                </div>

                <p className="text-xs text-gray-400">
                  Printed ID format
                </p>
              </div>

              {/* =================================================
                  ACTUAL FAN CARD
              ================================================== */}
              <div className="relative mx-auto w-full max-w-[850px] overflow-hidden rounded-[20px] border-[5px] border-[#252525] bg-[#eeeeeb] shadow-2xl">
                {/* SECURITY GRID BACKGROUND */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px)
                    `,
                    backgroundSize: "5px 5px",
                  }}
                />

                {/* SUBTLE SECURITY LINES */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,.035) 4px)",
                    }}
                  />
                </div>

                <div className="relative p-4 sm:p-6 md:p-7">
                  {/* TOP TITLE */}
                  <div className="text-center">
                    <h3 className="text-[clamp(18px,3vw,32px)] font-black tracking-tight text-[#555]">
                      CELEBRITY MANAGEMENT
                    </h3>

                    <p className="mt-1 text-[clamp(8px,1.2vw,13px)] font-black uppercase tracking-[0.12em] text-[#b3362f]">
                      OFFICIAL PREMIUM FAN CARD
                    </p>
                  </div>

                  {/* MAIN CARD CONTENT */}
                  <div className="mt-5 grid grid-cols-[82px_minmax(0,1fr)_92px] gap-4 sm:grid-cols-[130px_minmax(0,1fr)_125px] sm:gap-6 md:mt-6">
                    {/* LEFT PHOTO */}
                    <div className="flex flex-col">
                      <div className="aspect-[3/4] w-full overflow-hidden border-2 border-[#5d5d5d] bg-[#ddd]">
                        {member?.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={memberName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#333] text-3xl font-black text-white">
                            {memberName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* SIGNATURE */}
                      <div className="mt-3 border-b border-[#777] pb-1 text-center">
                        <span className="font-serif text-sm italic text-[#444]">
                          {memberName
                            .split(" ")[0]}
                        </span>
                      </div>

                      <p className="mt-1 text-center text-[7px] font-semibold uppercase text-[#777] sm:text-[9px]">
                        Authorized Signature
                      </p>
                    </div>

                    {/* INFORMATION */}
                    <div className="min-w-0 pt-1">
                      <p className="mb-3 text-center text-[9px] font-black uppercase tracking-[0.08em] text-[#b3362f] sm:text-[12px]">
                        PRIVATE VIP ACCESS
                        AUTHORIZATION
                      </p>

                      <CardInfoRow
                        label="NAME"
                        value={memberName}
                      />

                      <CardInfoRow
                        label="COUNTRY"
                        value={
                          member?.country ||
                          "NIGERIA"
                        }
                      />

                      <CardInfoRow
                        label="MEMBERSHIP LEVEL"
                        value={getLevelLabel(
                          membershipLevel
                        )}
                      />

                      <CardInfoRow
                        label="MEMBERSHIP STATUS"
                        value={getStatusText(
                          status
                        )}
                      />

                      <CardInfoRow
                        label="REG DATE"
                        value={
                          issueDate
                            ? formatDate(
                                issueDate
                              )
                            : "—"
                        }
                      />

                      <CardInfoRow
                        label="VALID TILL"
                        value={
                          expiryDate
                            ? formatDate(
                                expiryDate
                              )
                            : "—"
                        }
                      />

                      <CardInfoRow
                        label="I.D. NO"
                        value={card.membership_id}
                      />
                    </div>

                    {/* RIGHT PHOTO + QR */}
                    <div className="flex flex-col items-center">
                      <div className="aspect-[4/5] w-full overflow-hidden border-2 border-[#5d5d5d] bg-[#ddd]">
                        {member?.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={memberName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#333] text-2xl font-black text-white">
                            {memberName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-center text-[6px] font-bold uppercase leading-tight text-[#555] sm:text-[8px]">
                        SCAN THE QR CODE TO
                        <br />
                        VERIFY MEMBERSHIP
                      </p>

                      <div className="mt-1 flex h-[62px] w-[62px] items-center justify-center bg-white p-1 sm:h-[88px] sm:w-[88px]">
                        <QRCodeSVG
                          value={qrValue}
                          size={80}
                          bgColor="#ffffff"
                          fgColor="#111111"
                          level="H"
                          includeMargin={false}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTION */}
                  <div className="mt-5 border-t-2 border-[#777] pt-3 sm:mt-6 sm:pt-4">
                    <div className="grid grid-cols-[55px_1fr] items-end gap-3 sm:grid-cols-[90px_1fr]">
                      {/* CHIP */}
                      <div>
                        <div className="relative h-[34px] w-[48px] overflow-hidden rounded-[6px] border border-[#9b7b25] bg-gradient-to-br from-[#e4c768] via-[#cda83c] to-[#a77d20] shadow-inner sm:h-[45px] sm:w-[64px]">
                          <div className="absolute left-1/2 top-0 h-full w-px bg-[#96751f]" />
                          <div className="absolute left-0 top-1/2 h-px w-full bg-[#96751f]" />
                          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#96751f]" />
                        </div>
                      </div>

                      {/* CERTIFICATION TEXT */}
                      <p className="text-[7px] font-medium leading-[1.35] text-[#555] sm:text-[9px] md:text-[10px]">
                        This is to certify that the
                        above named person is an
                        officially registered member
                        of the Celebrity Management
                        fan community and is entitled
                        to the privileges associated
                        with this membership.
                      </p>
                    </div>

                    <div className="mt-2 text-center text-[7px] font-bold text-[#777] sm:text-[9px]">
                      www.celebritymanagement.com
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MEMBER INFORMATION */}
            <section className="mt-8 rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Member
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Member Information
              </h2>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black text-xl font-bold text-white">
                  {member?.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={memberName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    memberName
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {memberName}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {member?.email ||
                      "No email"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Phone"
                  value={member?.phone || "—"}
                />

                <InfoItem
                  label="Country"
                  value={member?.country || "—"}
                />

                <InfoItem
                  label="Account Role"
                  value={
                    member?.role
                      ? member.role.replace(
                          "_",
                          " "
                        )
                      : "—"
                  }
                />

                <InfoItem
                  label="Account Status"
                  value={
                    member?.status || "—"
                  }
                />
              </div>

              {member && (
                <Link
                  href={`/management/members/${member.id}`}
                  className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
                >
                  View member profile →
                </Link>
              )}
            </section>
          </div>

          {/* =====================================================
              RIGHT — MANAGEMENT CONTROLS
          ====================================================== */}
          <aside className="space-y-6">
            {/* MEMBERSHIP SETTINGS */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Membership
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Card Settings
              </h2>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Membership ID
                </label>

                <div className="mt-2 rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm font-semibold">
                  {card.membership_id}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Membership Level
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {MEMBERSHIP_LEVELS.map(
                    (level) => {
                      const selected =
                        membershipLevel ===
                        level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setMembershipLevel(
                              level
                            )
                          }
                          className={`rounded-xl border p-3 text-left capitalize transition ${
                            selected
                              ? "border-black bg-black text-white"
                              : "border-black/10 bg-white hover:border-black/30"
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {level}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as FanCardStatus
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option
                          .charAt(0)
                          .toUpperCase() +
                          option.slice(1)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Valid From
                </label>

                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) =>
                    setIssueDate(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Valid Until
                </label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(event) =>
                    setExpiryDate(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </section>

            {/* REJECTION */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Review
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Rejection Reason
              </h2>

              <textarea
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Enter a reason if the application is rejected..."
                className="mt-4 w-full resize-none rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </section>

            {/* NOTES */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Internal
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Management Notes
              </h2>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                placeholder="Add internal notes..."
                className="mt-4 w-full resize-none rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </section>

            {/* ACTIONS */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold">
                Management Actions
              </h2>

              <div className="mt-5 space-y-3">
                {card.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={approveCard}
                      disabled={saving}
                      className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {saving
                        ? "Processing..."
                        : "Approve Application"}
                    </button>

                    <button
                      type="button"
                      onClick={rejectCard}
                      disabled={saving}
                      className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Reject Application
                    </button>
                  </>
                )}

                {card.status === "approved" && (
                  <button
                    type="button"
                    onClick={activateCard}
                    disabled={saving}
                    className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {saving
                      ? "Processing..."
                      : "Activate Card"}
                  </button>
                )}

                {card.status === "active" && (
                  <button
                    type="button"
                    onClick={cancelCard}
                    disabled={saving}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {saving
                      ? "Processing..."
                      : "Cancel Card"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={saving}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </section>

            {/* VERIFICATION */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Verification
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                QR Verification
              </h2>

              <div className="mt-5 flex justify-center rounded-2xl bg-gray-50 p-6">
                <QRCodeSVG
                  value={qrValue}
                  size={150}
                  bgColor="#ffffff"
                  fgColor="#111111"
                  level="H"
                  includeMargin
                />
              </div>

              <p className="mt-4 break-all rounded-xl bg-gray-50 p-3 text-center font-mono text-[10px] text-gray-500">
                {qrValue}
              </p>
            </section>

            {/* ACTIVITY */}
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Activity
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Timeline
              </h2>

              <div className="mt-6 space-y-5">
                <TimelineItem
                  title="Application created"
                  value={formatDateTime(
                    card.created_at
                  )}
                />

                {card.approved_at && (
                  <TimelineItem
                    title="Approved"
                    value={formatDateTime(
                      card.approved_at
                    )}
                  />
                )}

                <TimelineItem
                  title="Last updated"
                  value={formatDateTime(
                    card.updated_at
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   CARD INFORMATION ROW
============================================================ */

function CardInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-[5px] flex items-baseline gap-1 text-[8px] leading-tight sm:mb-2 sm:text-[11px] md:text-[13px]">
      <span className="shrink-0 font-black text-[#222]">
        {label}:
      </span>

      <span className="min-w-0 truncate font-semibold uppercase text-[#333]">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium capitalize text-gray-800">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   TIMELINE
============================================================ */

function TimelineItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {value}
        </p>
      </div>
    </div>
  );
}