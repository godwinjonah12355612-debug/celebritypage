"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();

  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loadingCelebrities, setLoadingCelebrities] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [celebrityId, setCelebrityId] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [capacity, setCapacity] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketCurrency, setTicketCurrency] = useState("USD");
  const [ticketUrl, setTicketUrl] = useState("");

  // Keep these as strings.
  // An empty string means there is no image.
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"draft" | "published">(
    "draft"
  );

  const [featured, setFeatured] = useState(false);
  const [publicVisible, setPublicVisible] = useState(false);

  useEffect(() => {
    loadCelebrities();
  }, []);

  async function loadCelebrities() {
    setLoadingCelebrities(true);

    const { data, error } = await supabase
      .from("celebrities")
      .select("id, name, image_url")
      .eq("management_status", "active")
      .order("name", { ascending: true });

    if (error) {
      console.error("CELEBRITIES LOAD ERROR:", error);
      setError(error.message);
    } else {
      setCelebrities(data || []);
    }

    setLoadingCelebrities(false);
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    const oldGeneratedSlug = createSlug(title);

    setTitle(value);

    if (!slug || slug === oldGeneratedSlug) {
      setSlug(createSlug(value));
    }
  }

  function handleImageChange(file: File | null) {
    setImageFile(file);

    if (!file) {
      setImageUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  }

  async function uploadImage(file: File): Promise<string> {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `event-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${extension}`;

    const filePath = `events/${fileName}`;

    const { error } = await supabase.storage
      .from("event-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Image upload failed: ${error.message}`
      );
    }

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Enter an event title.");
      return;
    }

    if (!eventDate) {
      setError("Select the event date.");
      return;
    }

    if (!venue.trim()) {
      setError("Enter the event venue.");
      return;
    }

    if (!city.trim()) {
      setError("Enter the event city.");
      return;
    }

    if (!country.trim()) {
      setError("Enter the event country.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const finalSlug = slug.trim() || createSlug(title);

      if (!finalSlug) {
        throw new Error(
          "A valid event slug could not be created."
        );
      }

      // Only upload when a file was actually selected.
      // The result is always string when successful.
      let finalImageUrl: string | null = null;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const { error: insertError } = await supabase
        .from("events")
        .insert({
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() || null,
          event_type: eventType.trim() || null,

          celebrity_id: celebrityId || null,

          image_url: finalImageUrl,

          event_date: eventDate,
          start_time: startTime || null,
          end_time: endTime || null,

          venue: venue.trim(),
          address: address.trim() || null,
          city: city.trim(),
          country: country.trim(),

          capacity: capacity.trim()
            ? Number(capacity)
            : null,

          ticket_price: ticketPrice.trim()
            ? Number(ticketPrice)
            : null,

          ticket_currency: ticketCurrency,
          ticket_url: ticketUrl.trim() || null,

          status,

          featured,

          public_visible:
            status === "published"
              ? publicVisible
              : false,

          created_by: user.id,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess("Event created successfully.");

      setTimeout(() => {
        router.push("/management/events");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("CREATE EVENT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the event."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/management/events"
            className="mb-5 inline-flex text-sm font-medium text-neutral-500 hover:text-black"
          >
            ← Back to Events
          </Link>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Management
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Create Event
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Create an event and publish it to the public website.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Basic Information"
              description="Enter the main information about this event."
            />

            <div className="mt-6 grid gap-5">
              <Field
                label="Event Title"
                required
              >
                <input
                  value={title}
                  onChange={(e) =>
                    handleTitleChange(e.target.value)
                  }
                  placeholder="e.g. Summer Celebrity Gala"
                  className={inputClass}
                  required
                />
              </Field>

              <Field
                label="Slug"
                required
                hint="Used in the public event URL."
              >
                <input
                  value={slug}
                  onChange={(e) =>
                    setSlug(createSlug(e.target.value))
                  }
                  placeholder="summer-celebrity-gala"
                  className={inputClass}
                  required
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Event Type">
                  <input
                    value={eventType}
                    onChange={(e) =>
                      setEventType(e.target.value)
                    }
                    placeholder="Concert, Gala, Meet & Greet..."
                    className={inputClass}
                  />
                </Field>

                <Field label="Celebrity">
                  <select
                    value={celebrityId}
                    onChange={(e) =>
                      setCelebrityId(e.target.value)
                    }
                    className={inputClass}
                    disabled={loadingCelebrities}
                  >
                    <option value="">
                      {loadingCelebrities
                        ? "Loading celebrities..."
                        : "No celebrity / General Event"}
                    </option>

                    {celebrities.map((celebrity) => (
                      <option
                        key={celebrity.id}
                        value={celebrity.id}
                      >
                        {celebrity.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the event..."
                  rows={6}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* DATE AND TIME */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Date & Time"
              description="Set when the event will take place."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field
                label="Event Date"
                required
              >
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Start Time">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="End Time">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* LOCATION */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Location"
              description="Tell attendees where the event will take place."
            />

            <div className="mt-6 grid gap-5">
              <Field
                label="Venue"
                required
              >
                <input
                  value={venue}
                  onChange={(e) =>
                    setVenue(e.target.value)
                  }
                  placeholder="e.g. Landmark Event Centre"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Address">
                <input
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Full street address"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="City"
                  required
                >
                  <input
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    placeholder="Lagos"
                    className={inputClass}
                    required
                  />
                </Field>

                <Field
                  label="Country"
                  required
                >
                  <input
                    value={country}
                    onChange={(e) =>
                      setCountry(e.target.value)
                    }
                    placeholder="Nigeria"
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* TICKETS */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Tickets"
              description="Configure ticket and capacity information."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field label="Capacity">
                <input
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value)
                  }
                  placeholder="500"
                  className={inputClass}
                />
              </Field>

              <Field label="Ticket Price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketPrice}
                  onChange={(e) =>
                    setTicketPrice(e.target.value)
                  }
                  placeholder="100.00"
                  className={inputClass}
                />
              </Field>

              <Field label="Currency">
                <select
                  value={ticketCurrency}
                  onChange={(e) =>
                    setTicketCurrency(e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="Ticket URL"
                hint="Optional external ticket purchase link."
              >
                <input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) =>
                    setTicketUrl(e.target.value)
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* IMAGE */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Event Image"
              description="Add a promotional image for the event."
            />

            <div className="mt-6">
              {imageUrl && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-200">
                  <img
                    src={imageUrl}
                    alt="Event preview"
                    className="h-64 w-full object-cover"
                  />
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center transition hover:border-black hover:bg-white">
                <span className="text-sm font-semibold">
                  Choose Event Image
                </span>

                <span className="mt-1 text-xs text-neutral-500">
                  JPG, PNG or WebP
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(
                      e.target.files?.[0] || null
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* PUBLISHING */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <SectionHeading
              title="Publishing"
              description="Control how this event appears on the public website."
            />

            <div className="mt-6 space-y-5">
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => {
                    const value =
                      e.target.value as
                        | "draft"
                        | "published";

                    setStatus(value);

                    if (value === "draft") {
                      setPublicVisible(false);
                    }
                  }}
                  className={inputClass}
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </Field>

              <Toggle
                label="Visible on public website"
                description="Allow visitors to see this event on the public Events page."
                checked={publicVisible}
                disabled={status !== "published"}
                onChange={setPublicVisible}
              />

              <Toggle
                label="Featured event"
                description="Highlight this event in featured event sections."
                checked={featured}
                onChange={setFeatured}
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/management/events"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold hover:border-black"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating Event..."
                : status === "published"
                ? "Create & Publish"
                : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-neutral-100 bg-neutral-50 opacity-50"
          : "border-neutral-200 hover:border-black"
      }`}
    >
      <div className="pr-5">
        <p className="text-sm font-semibold">
          {label}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-black" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}