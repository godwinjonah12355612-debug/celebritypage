"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  booking_available: boolean;
};

type FormData = {
  celebrity_id: string;
  event_type: string;
  appearance_type: string;
  event_date: string;
  event_time: string;
  location: string;
  audience_size: string;
  budget: string;
  message: string;
};

const initialForm: FormData = {
  celebrity_id: "",
  event_type: "",
  appearance_type: "",
  event_date: "",
  event_time: "",
  location: "",
  audience_size: "",
  budget: "",
  message: "",
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);

  const [loadingCelebrities, setLoadingCelebrities] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [submittedReference, setSubmittedReference] = useState("");

  useEffect(() => {
    async function loadCelebrities() {
      setLoadingCelebrities(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("celebrities")
        .select(`
          id,
          name,
          slug,
          category,
          image_url,
          booking_available
        `)
        .eq("management_status", "active")
        .eq("booking_available", true)
        .order("name", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
        setLoadingCelebrities(false);
        return;
      }

      const availableCelebrities = (data || []) as Celebrity[];

      setCelebrities(availableCelebrities);

      const celebritySlug = searchParams.get("celebrity");

      if (celebritySlug) {
        const selected = availableCelebrities.find(
          (celebrity) => celebrity.slug === celebritySlug
        );

        if (selected) {
          setForm((current) => ({
            ...current,
            celebrity_id: selected.id,
          }));
        }
      }

      setLoadingCelebrities(false);
    }

    loadCelebrities();
  }, [searchParams]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");

    if (!form.celebrity_id) {
      setErrorMessage("Please select a celebrity.");
      return;
    }

    if (!form.event_type) {
      setErrorMessage("Please select an event type.");
      return;
    }

    if (!form.event_date) {
      setErrorMessage("Please select the event date.");
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage("Please enter the event location.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push(
          `/member/login?redirect=${encodeURIComponent("/booking")}`
        );
        return;
      }

      const audienceSize = form.audience_size.trim()
        ? Number(form.audience_size)
        : null;

      if (
        audienceSize !== null &&
        (Number.isNaN(audienceSize) || audienceSize < 1)
      ) {
        setErrorMessage("Please enter a valid audience size.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          member_id: user.id,
          celebrity_id: form.celebrity_id,
          event_type: form.event_type,
          appearance_type: form.appearance_type || null,
          event_date: form.event_date,
          event_time: form.event_time || null,
          location: form.location.trim(),
          audience_size: audienceSize,
          budget: form.budget.trim() || null,
          message: form.message.trim() || null,
        })
        .select("id, booking_reference")
        .single();

      if (error) {
        console.error("BOOKING INSERT ERROR:", error);
        setErrorMessage(error.message);
        setSubmitting(false);
        return;
      }

      setSubmittedReference(data.booking_reference || "Submitted");
    } catch (error) {
      console.error("BOOKING ERROR:", error);

      setErrorMessage(
        "Something went wrong while submitting your booking. Please try again."
      );

      setSubmitting(false);
    }
  }

  if (submittedReference) {
    return (
      <div className="min-h-screen bg-[#f5f5f2] text-black">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              CM
            </Link>

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Back to Home
            </Link>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16">
          <div className="w-full max-w-2xl rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
              ✓
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Booking Request Received
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your request has been submitted.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
              Our management team will review your request and contact you with
              the next steps.
            </p>

            <div className="mt-8 rounded-2xl bg-[#f7f7f5] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Booking Reference
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-wide">
                {submittedReference}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/account"
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Go to My Account
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold hover:border-black"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            CM
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link href="/" className="text-gray-500 hover:text-black">
              Home
            </Link>

            <Link
              href="/celebrities"
              className="text-gray-500 hover:text-black"
            >
              Celebrities
            </Link>

            <Link href="/about" className="text-gray-500 hover:text-black">
              About
            </Link>

            <Link href="/contact" className="text-gray-500 hover:text-black">
              Contact
            </Link>

            <Link
              href="/member/login"
              className="rounded-xl bg-black px-5 py-2.5 text-white hover:bg-gray-800"
            >
              Sign In
            </Link>
          </nav>

          <Link
            href="/member/login"
            className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white md:hidden"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Celebrity Bookings
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Bring extraordinary talent to your event.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Submit your booking request and our management team will review the
            details, coordinate availability, and guide you through the booking
            process.
          </p>
        </div>
      </section>

      {/* FORM */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Request Details
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Tell us about your event
              </h2>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="space-y-7">
              {/* Celebrity */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Celebrity
                </label>

                <select
                  name="celebrity_id"
                  value={form.celebrity_id}
                  onChange={handleChange}
                  disabled={loadingCelebrities}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingCelebrities
                      ? "Loading celebrities..."
                      : "Select a celebrity"}
                  </option>

                  {celebrities.map((celebrity) => (
                    <option key={celebrity.id} value={celebrity.id}>
                      {celebrity.name} — {celebrity.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event type */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Event Type
                  </label>

                  <select
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  >
                    <option value="">Select event type</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Concert">Concert</option>
                    <option value="Festival">Festival</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Brand Event">Brand Event</option>
                    <option value="Charity Event">Charity Event</option>
                    <option value="Media Appearance">
                      Media Appearance
                    </option>
                    <option value="Speaking Engagement">
                      Speaking Engagement
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Appearance Type
                  </label>

                  <select
                    name="appearance_type"
                    value={form.appearance_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  >
                    <option value="">Select appearance</option>
                    <option value="In Person">In Person</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Performance">Performance</option>
                    <option value="Meet & Greet">Meet & Greet</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Appearance Only">
                      Appearance Only
                    </option>
                  </select>
                </div>
              </div>

              {/* Date / time */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Event Date
                  </label>

                  <input
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Event Time
                  </label>

                  <input
                    type="time"
                    name="event_time"
                    value={form.event_time}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Location / audience */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Event Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, venue or address"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Expected Audience
                  </label>

                  <input
                    type="number"
                    name="audience_size"
                    value={form.audience_size}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Estimated Budget
                </label>

                <input
                  type="text"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="e.g. $25,000"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Additional Information
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Tell us anything else our management team should know..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none focus:border-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || loadingCelebrities}
                className="w-full rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting Request..." : "Submit Booking Request"}
              </button>

              <p className="text-center text-xs leading-5 text-gray-400">
                You must be signed in to submit a booking request. Our team
                will review your request before any booking is confirmed.
              </p>
            </div>
          </form>

          {/* SIDEBAR */}
          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-black p-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Booking Process
              </p>

              <div className="mt-7 space-y-6">
                <ProcessStep
                  number="01"
                  title="Request"
                  description="Submit your event and talent requirements."
                />

                <ProcessStep
                  number="02"
                  title="Review"
                  description="Our management team reviews availability and requirements."
                />

                <ProcessStep
                  number="03"
                  title="Quote"
                  description="Receive booking terms and the proposed fee."
                />

                <ProcessStep
                  number="04"
                  title="Confirmation"
                  description="Once approved and payment requirements are completed, your booking is confirmed."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Need Help?
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Speak with our team
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                For complex bookings, availability questions, or corporate
                enquiries, contact our management team directly.
              </p>

              <Link
                href="/contact"
                className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4"
              >
                Contact Management →
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">CM</p>
              <p className="mt-1 text-sm text-gray-400">
                Celebrity Management
              </p>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-gray-500">
              <Link href="/about" className="hover:text-black">
                About
              </Link>

              <Link href="/contact" className="hover:text-black">
                Contact
              </Link>

              <Link href="/terms" className="hover:text-black">
                Terms
              </Link>

              <Link href="/privacy" className="hover:text-black">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-700 text-[10px] font-semibold">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f2] text-sm text-gray-500">
          Loading booking page...
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}