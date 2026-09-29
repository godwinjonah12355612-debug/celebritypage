"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
};

type FanCard = {
  id: string;
  member_id: string;
  membership_id: string | null;
  membership_level:
    | "standard"
    | "premium"
    | "vip"
    | "elite";
  status:
    | "pending"
    | "approved"
    | "active"
    | "rejected"
    | "expired"
    | "cancelled";
  issue_date: string | null;
  expiry_date: string | null;
  rejection_reason: string | null;
  notes: string | null;
};

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClasses(status: FanCard["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "approved":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-100 text-gray-600";
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FanCardApplyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [existingCard, setExistingCard] =
    useState<FanCard | null>(null);

  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadApplication();
  }, []);

  async function loadApplication() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/member/login");
      return;
    }

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        display_name,
        email,
        phone,
        country,
        avatar_url
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "PROFILE LOAD ERROR:",
        profileError
      );

      setErrorMessage(
        "We could not load your member profile."
      );

      setLoading(false);
      return;
    }

    setProfile(profileData as Profile);

    const {
      data: cardData,
      error: cardError,
    } = await supabase
      .from("fan_cards")
      .select(`
        id,
        member_id,
        membership_id,
        membership_level,
        status,
        issue_date,
        expiry_date,
        rejection_reason,
        notes
      `)
      .eq("member_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (cardError) {
      console.error(
        "FAN CARD LOAD ERROR:",
        cardError
      );

      setErrorMessage(
        "We could not check your fan card application."
      );
    } else if (cardData) {
      setExistingCard(cardData as FanCard);
      setNotes(cardData.notes || "");
    }

    setLoading(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/member/login");
      return;
    }

    /*
      Do not create another application when the member
      already has an active, pending, or approved card.
    */

    if (
      existingCard &&
      ["pending", "approved", "active"].includes(
        existingCard.status
      )
    ) {
      setErrorMessage(
        "You already have a fan card application or membership."
      );

      setSubmitting(false);
      return;
    }

    /*
      Generate membership ID.
      Example:
      CM-2026-0001
    */

    const {
      count: cardCount,
      error: countError,
    } = await supabase
      .from("fan_cards")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (countError) {
      console.error(
        "FAN CARD COUNT ERROR:",
        countError
      );

      setErrorMessage(
        "We could not generate your membership ID. Please try again."
      );

      setSubmitting(false);
      return;
    }

    const nextNumber =
      (cardCount ?? 0) + 1;

    const membershipId =
      `CM-${new Date().getFullYear()}-${String(
        nextNumber
      ).padStart(4, "0")}`;

    const {
      data,
      error,
    } = await supabase
      .from("fan_cards")
      .insert({
        member_id: user.id,
        membership_id: membershipId,
        membership_level: "standard",
        status: "pending",
        notes: notes.trim() || null,
      })
      .select(`
        id,
        member_id,
        membership_id,
        membership_level,
        status,
        issue_date,
        expiry_date,
        rejection_reason,
        notes
      `)
      .single();

    if (error) {
      console.error(
        "FAN CARD APPLICATION ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "We could not submit your fan card application."
      );

      setSubmitting(false);
      return;
    }

    setExistingCard(data as FanCard);

    setSuccessMessage(
      "Your fan card application has been submitted successfully."
    );

    setSubmitting(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/member/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1f1ee] px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />

          <p className="mt-4 text-sm text-black/45">
            Loading your membership...
          </p>
        </div>
      </main>
    );
  }

  const displayName =
    profile?.display_name ||
    profile?.full_name ||
    "MEMBER";

  /*
    ============================================================
    EXISTING APPLICATION
  ============================================================
  */

  if (existingCard) {
    const isPending =
      existingCard.status === "pending";

    const isRejected =
      existingCard.status === "rejected";

    const isApproved =
      existingCard.status === "approved";

    const isActive =
      existingCard.status === "active";

    return (
      <main className="min-h-screen bg-[#f1f1ee] text-black">
        {/* HEADER */}
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <Link
              href="/account"
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[10px] font-black text-white">
                CM
              </span>

              <span className="hidden text-xs font-black tracking-[0.2em] sm:block">
                CELEBRITY MANAGEMENT
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="hidden text-sm font-medium text-black/50 hover:text-black sm:block"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
              Official Membership
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Your Fan Card
            </h1>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          {/* ACTIVE CARD */}

          {isActive && (
            <FanCardVisual
              profile={profile}
              memberName={displayName}
              card={existingCard}
              active
            />
          )}

          {/* PENDING / APPROVED / REJECTED */}

          {!isActive && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <FanCardVisual
                  profile={profile}
                  memberName={displayName}
                  card={existingCard}
                />
              </div>

              <div>
                <section className="rounded-3xl border border-black/10 bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                        Application Status
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {isPending &&
                          "Application Under Review"}

                        {isApproved &&
                          "Application Approved"}

                        {isRejected &&
                          "Application Not Approved"}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses(
                        existingCard.status
                      )}`}
                    >
                      {formatStatus(
                        existingCard.status
                      )}
                    </span>
                  </div>

                  {isPending && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-semibold text-amber-900">
                        Your application has been
                        received.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-amber-800/70">
                        Management is reviewing your
                        membership application. Your
                        official card will become
                        available after approval and
                        activation.
                      </p>
                    </div>
                  )}

                  {isApproved && (
                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm font-semibold text-blue-900">
                        Your application has been approved.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-800/70">
                        Management has approved your
                        membership. Your card will be
                        available after activation.
                      </p>
                    </div>
                  )}

                  {isRejected && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                      <p className="text-sm font-semibold text-red-900">
                        Your application was not approved.
                      </p>

                      {existingCard.rejection_reason && (
                        <>
                          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-red-900/50">
                            Management Note
                          </p>

                          <p className="mt-1 text-sm leading-6 text-red-800/75">
                            {
                              existingCard.rejection_reason
                            }
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-6 space-y-4 border-t border-black/10 pt-6">
                    <InfoRow
                      label="Membership ID"
                      value={
                        existingCard.membership_id ||
                        "Pending"
                      }
                    />

                    <InfoRow
                      label="Membership Level"
                      value={
                        existingCard.membership_level
                      }
                    />

                    <InfoRow
                      label="Valid From"
                      value={formatDate(
                        existingCard.issue_date
                      )}
                    />

                    <InfoRow
                      label="Valid Until"
                      value={formatDate(
                        existingCard.expiry_date
                      )}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/account"
                      className="rounded-full bg-black px-5 py-3 text-xs font-bold text-white"
                    >
                      Back to Dashboard
                    </Link>

                    {isActive && (
                      <Link
                        href="/fan-card/my-card"
                        className="rounded-full border border-black/10 px-5 py-3 text-xs font-bold"
                      >
                        View Full Card
                      </Link>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /*
    ============================================================
    NEW APPLICATION
  ============================================================
  */

  return (
    <main className="min-h-screen bg-[#f1f1ee] text-black">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <Link
            href="/account"
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[10px] font-black text-white">
              CM
            </span>

            <span className="hidden text-xs font-black tracking-[0.2em] sm:block">
              CELEBRITY MANAGEMENT
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="hidden text-sm font-medium text-black/50 hover:text-black sm:block"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/35">
            Official Membership
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Apply for your Fan Card
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
            Submit your membership application. Your
            official Celebrity Management fan card will be
            issued after management review and approval.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          {/* APPLICATION FORM */}

          <section>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Member Information
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Application Details
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Full Name"
                  value={
                    profile?.full_name ||
                    "Not provided"
                  }
                />

                <ProfileField
                  label="Display Name"
                  value={
                    profile?.display_name ||
                    "Not provided"
                  }
                />

                <ProfileField
                  label="Email"
                  value={
                    profile?.email ||
                    "Not provided"
                  }
                />

                <ProfileField
                  label="Phone"
                  value={
                    profile?.phone ||
                    "Not provided"
                  }
                />

                <ProfileField
                  label="Country"
                  value={
                    profile?.country ||
                    "Not provided"
                  }
                />
              </div>

              <div className="mt-8 border-t border-black/10 pt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                  Membership
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Official Fan Card
                </h2>

                <div className="mt-5 rounded-2xl border border-black/10 bg-[#f8f8f5] p-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-sm font-black text-white">
                      CM
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Standard Membership
                      </p>

                      <p className="mt-1 text-sm leading-6 text-black/45">
                        Your application begins as a
                        standard membership request.
                        Management can assign the
                        appropriate membership level
                        during review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label
                  htmlFor="notes"
                  className="text-xs font-semibold text-black/60"
                >
                  Additional Information{" "}
                  <span className="font-normal text-black/35">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell management anything relevant to your membership application..."
                  className="mt-2 w-full resize-none rounded-2xl border border-black/10 px-4 py-3 text-[16px] leading-6 outline-none placeholder:text-black/30 focus:border-black"
                />

                <p className="mt-2 text-right text-[11px] text-black/30">
                  {notes.length}/1000
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-[#fafaf8] p-4">
                <p className="text-xs leading-5 text-black/50">
                  By submitting this application, you
                  confirm that the information associated
                  with your member account is accurate and
                  understand that your application must be
                  reviewed by Celebrity Management.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Fan Card Application"}
              </button>
            </form>
          </section>

          {/* CARD PREVIEW */}

          <aside>
            <div className="sticky top-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Card Preview
              </p>

              <FanCardPreview
                profile={profile}
                memberName={displayName}
              />

              <div className="mt-5 rounded-3xl border border-black/10 bg-white p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                  What happens next
                </p>

                <div className="mt-5 space-y-5">
                  <Step
                    number="1"
                    title="Submit application"
                    text="Your membership request is sent to management."
                  />

                  <Step
                    number="2"
                    title="Management review"
                    text="Your application and account information are reviewed."
                  />

                  <Step
                    number="3"
                    title="Card approval"
                    text="Management assigns your membership level and approves your card."
                  />

                  <Step
                    number="4"
                    title="Card activation"
                    text="Your official digital fan card becomes available."
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   FAN CARD PREVIEW
============================================================ */

function FanCardPreview({
  profile,
  memberName,
}: {
  profile: Profile | null;
  memberName: string;
}) {
  return (
    <div className="group relative aspect-auto w-full overflow-hidden rounded-[28px] border-[3px] border-[#8f7228] bg-gradient-to-br from-[#f4f1e7] via-[#e8e4d8] to-[#d8d3c5] shadow-[0_25px_60px_rgba(0,0,0,0.22)] sm:aspect-[1.586/1]">

      {/* PREMIUM INNER BORDER */}
      <div className="pointer-events-none absolute inset-[5px] rounded-[23px] border border-[#b89a4a]/60" />

      {/* GOLD CORNER ACCENTS */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full border-[12px] border-[#c5a24b]/20" />

      <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full border-[14px] border-[#c5a24b]/20" />

      {/* PREMIUM LIGHT */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-72 -translate-y-1/2 rotate-[-25deg] bg-white/20 blur-2xl" />

      {/* SECURITY GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px)
          `,
          backgroundSize: "5px 5px",
        }}
      />

      <div className="relative z-10 p-4 sm:p-5">
        {/* HEADER */}

        <div className="text-center">
          <h2 className="text-[22px] font-black tracking-tight text-[#555]">
            CELEBRITY MANAGEMENT
          </h2>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#b3362f]">
            OFFICIAL FAN CARD
          </p>

          <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[#777]">
            APPLICATION / PENDING
          </p>
        </div>

        {/* CARD BODY */}

        <div className="mt-5 grid grid-cols-[75px_minmax(0,1fr)_78px] gap-3">
          {/* LARGE PHOTO */}

          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl border-2 border-[#8f7228] bg-[#ddd] shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#333] text-2xl font-black text-white">
                  {memberName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="mt-3 border-b border-[#777] pb-1 text-center">
              <span className="font-serif text-xs italic text-[#444]">
                {memberName
                  .split(" ")[0]}
              </span>
            </div>

            <p className="mt-1 text-center text-[6px] font-bold uppercase text-[#777]">
              Signature
            </p>
          </div>

          {/* INFORMATION */}

          <div className="pt-1">
            <p className="mb-3 text-center text-[8px] font-black uppercase leading-tight text-[#b3362f]">
              PRIVATE VIP ACCESS
              <br />
              AUTHORIZATION
            </p>

            <CardRow
              label="NAME"
              value={memberName}
            />

            <CardRow
              label="COUNTRY"
              value={
                profile?.country ||
                "NIGERIA"
              }
            />

            <CardRow
              label="LEVEL"
              value="STANDARD"
            />

            <CardRow
              label="STATUS"
              value="PENDING"
            />

            <CardRow
              label="REG"
              value="PENDING"
            />

            <CardRow
              label="VALID"
              value="PENDING"
            />

            <CardRow
              label="I.D. NO"
              value="AFTER APPROVAL"
            />
          </div>

          {/* RIGHT PHOTO / QR */}

          <div className="flex flex-col items-center">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border-2 border-[#8f7228] bg-[#ddd] shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#333] text-xl font-black text-white">
                  {memberName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[5px] font-bold uppercase leading-tight text-[#555]">
              QR AVAILABLE
              <br />
              AFTER APPROVAL
            </p>

            <div className="mt-1 flex h-[65px] w-[65px] items-center justify-center bg-white p-2">
              <div className="flex h-full w-full items-center justify-center border border-dashed border-[#777] text-center text-[6px] font-black uppercase text-[#777]">
                QR
                <br />
                PENDING
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="mt-4 border-t-2 border-[#777] pt-3">
          <div className="grid grid-cols-[50px_1fr] items-center gap-3">
            {/* CHIP */}

            <div className="relative h-[32px] w-[45px] overflow-hidden rounded-[5px] border border-[#9b7b25] bg-gradient-to-br from-[#e4c768] via-[#cda83c] to-[#a77d20]">
              <div className="absolute left-1/2 top-0 h-full w-px bg-[#96751f]" />

              <div className="absolute left-0 top-1/2 h-px w-full bg-[#96751f]" />

              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#96751f]" />
            </div>

            <p className="text-[7px] leading-[1.35] text-[#555]">
              This card represents a pending
              membership application. It is not
              an active membership credential
              until approved and activated by
              Celebrity Management.
            </p>
          </div>

          <p className="mt-2 text-center text-[7px] font-bold text-[#777]">
            CELEBRITY MANAGEMENT
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVE / EXISTING CARD
============================================================ */

function FanCardVisual({
  profile,
  memberName,
  card,
  active = false,
}: {
  profile: Profile | null;
  memberName: string;
  card: FanCard;
  active?: boolean;
}) {
  const qrValue =
    card.membership_id ||
    card.id;

  return (
    <div className="group relative aspect-auto w-full overflow-hidden rounded-[28px] border-[3px] border-[#8f7228] bg-gradient-to-br from-[#f4f1e7] via-[#e8e4d8] to-[#d8d3c5] shadow-[0_25px_60px_rgba(0,0,0,0.25)] sm:aspect-[1.586/1]">

      {/* PREMIUM INNER BORDER */}

      <div className="pointer-events-none absolute inset-[5px] rounded-[23px] border border-[#b89a4a]/60" />

      {/* GOLD CORNER ACCENTS */}

      <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full border-[14px] border-[#c5a24b]/20" />

      <div className="pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full border-[16px] border-[#c5a24b]/20" />

      {/* PREMIUM LIGHT */}

      <div className="pointer-events-none absolute -left-20 top-1/2 h-44 w-80 -translate-y-1/2 rotate-[-25deg] bg-white/20 blur-3xl" />

      {/* SECURITY GRID */}

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px)
          `,
          backgroundSize: "5px 5px",
        }}
      />

      <div className="relative z-10 p-4 sm:p-6">
        {/* HEADER */}

        <div className="text-center">
          <h2 className="text-[clamp(20px,4vw,32px)] font-black tracking-tight text-[#555]">
            CELEBRITY MANAGEMENT
          </h2>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#b3362f]">
            OFFICIAL PREMIUM FAN CARD
          </p>
        </div>

        {/* CARD BODY */}

        <div className="mt-5 grid grid-cols-[90px_minmax(0,1fr)_95px] gap-4 sm:grid-cols-[125px_minmax(0,1fr)_120px] sm:gap-6">
          {/* PHOTO */}

          <div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl border-2 border-[#8f7228] bg-[#ddd] shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#333] text-3xl font-black text-white">
                  {memberName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="mt-3 border-b border-[#777] pb-1 text-center">
              <span className="font-serif text-sm italic text-[#444]">
                {memberName
                  .split(" ")[0]}
              </span>
            </div>

            <p className="mt-1 text-center text-[7px] font-bold uppercase text-[#777]">
              Authorized Signature
            </p>
          </div>

          {/* INFO */}

          <div className="pt-1">
            <p className="mb-3 text-center text-[9px] font-black uppercase leading-tight text-[#b3362f]">
              PRIVATE VIP ACCESS
              <br />
              AUTHORIZATION
            </p>

            <CardRow
              label="NAME"
              value={memberName}
            />

            <CardRow
              label="COUNTRY"
              value={
                profile?.country ||
                "NIGERIA"
              }
            />

            <CardRow
              label="MEMBERSHIP LEVEL"
              value={card.membership_level}
            />

            <CardRow
              label="MEMBERSHIP STATUS"
              value={card.status}
            />

            <CardRow
              label="REG DATE"
              value={formatDate(
                card.issue_date
              )}
            />

            <CardRow
              label="VALID TILL"
              value={formatDate(
                card.expiry_date
              )}
            />

            <CardRow
              label="I.D. NO"
              value={
                card.membership_id ||
                "—"
              }
            />
          </div>

          {/* PHOTO + QR */}

          <div className="flex flex-col items-center">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border-2 border-[#8f7228] bg-[#ddd] shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#333] text-2xl font-black text-white">
                  {memberName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[6px] font-bold uppercase leading-tight text-[#555]">
              SCAN THE QR CODE TO
              <br />
              VERIFY MEMBERSHIP
            </p>

            <div className="mt-1 flex h-[70px] w-[70px] items-center justify-center bg-white p-1 sm:h-[90px] sm:w-[90px]">
              <QRCodeSVG
                value={qrValue}
                size={82}
                level="H"
                bgColor="#ffffff"
                fgColor="#111111"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* CHIP / DESCRIPTION */}

        <div className="mt-5 border-t-2 border-[#777] pt-3">
          <div className="grid grid-cols-[55px_1fr] items-center gap-3">
            <div className="relative h-[38px] w-[52px] overflow-hidden rounded-[5px] border border-[#9b7b25] bg-gradient-to-br from-[#e4c768] via-[#cda83c] to-[#a77d20]">
              <div className="absolute left-1/2 top-0 h-full w-px bg-[#96751f]" />

              <div className="absolute left-0 top-1/2 h-px w-full bg-[#96751f]" />

              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#96751f]" />
            </div>

            <p className="text-[7px] leading-[1.4] text-[#555] sm:text-[9px]">
              This is to certify that the above
              named person is a registered member
              of Celebrity Management and is
              entitled to the privileges associated
              with this membership.
            </p>
          </div>

          <p className="mt-2 text-center text-[7px] font-bold text-[#777] sm:text-[9px]">
            CELEBRITY MANAGEMENT
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CARD ROW
============================================================ */

function CardRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-2 text-[8px] leading-tight sm:text-[10px]">
      <span className="font-black uppercase text-[#222]">
        {label}:
      </span>{" "}
      <span className="font-semibold uppercase text-[#333]">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   PROFILE FIELD
============================================================ */

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-black/55">
        {label}
      </p>

      <div className="mt-2 break-words rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-black/35">
        {label}
      </span>

      <span className="break-all text-right text-sm font-semibold capitalize">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
        {number}
      </span>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-black/45">
          {text}
        </p>
      </div>
    </div>
  );
}