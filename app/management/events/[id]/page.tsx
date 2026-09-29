"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  image_url: string | null;
};

type EventForm = {
  title: string;
  slug: string;
  description: string;
  event_type: string;
  celebrity_id: string;
  image_url: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  capacity: string;
  ticket_price: string;
  ticket_currency: string;
  ticket_url: string;
  status: "draft" | "published" | "cancelled" | "completed";
  featured: boolean;
  public_visible: boolean;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const supabase = createClient();

  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState<EventForm>({
    title: "",
    slug: "",
    description: "",
    event_type: "",
    celebrity_id: "",
    image_url: "",
    event_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    address: "",
    city: "",
    country: "",
    capacity: "",
    ticket_price: "",
    ticket_currency: "USD",
    ticket_url: "",
    status: "draft",
    featured: false,
    public_visible: false,
  });

  useEffect(() => {
    loadEvent();
    loadCelebrities();
  }, [eventId]);

  async function loadEvent() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error || !data) {
      setError(error?.message || "Event not found.");
      setLoading(false);
      return;
    }

    setForm({
      title: data.title ?? "",
      slug: data.slug ?? "",
      description: data.description ?? "",
      event_type: data.event_type ?? "",
      celebrity_id: data.celebrity_id ?? "",
      image_url: data.image_url ?? "",
      event_date: data.event_date ?? "",
      start_time: data.start_time
        ? String(data.start_time).slice(0, 5)
        : "",
      end_time: data.end_time
        ? String(data.end_time).slice(0, 5)
        : "",
      venue: data.venue ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      country: data.country ?? "",
      capacity:
        data.capacity !== null && data.capacity !== undefined
          ? String(data.capacity)
          : "",
      ticket_price:
        data.ticket_price !== null &&
        data.ticket_price !== undefined
          ? String(data.ticket_price)
          : "",
      ticket_currency: data.ticket_currency ?? "USD",
      ticket_url: data.ticket_url ?? "",
      status: data.status ?? "draft",
      featured: data.featured ?? false,
      public_visible: data.public_visible ?? false,
    });

    setLoading(false);
  }

  async function loadCelebrities() {
    const { data, error } = await supabase
      .from("celebrities")
      .select("id, name, image_url")
      .eq("management_status", "active")
      .order("name");

    if (!error && data) {
      setCelebrities(data as Celebrity[]);
    }
  }

  function updateField<K extends keyof EventForm>(
    field: K,
    value: EventForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadImage(file: File): Promise<string> {
    setUploading(true);

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    setUploading(false);

    return data.publicUrl;
  }

  async function handleImageChange(
    file: File | null
  ) {
    setImageFile(file);

    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);

      updateField("image_url", imageUrl);

      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.title.trim()) {
        throw new Error("Event title is required.");
      }

      if (!form.event_date) {
        throw new Error("Event date is required.");
      }

      if (!form.venue.trim()) {
        throw new Error("Venue is required.");
      }

      const finalSlug =
        form.slug.trim() || createSlug(form.title);

      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: form.title.trim(),
          slug: finalSlug,
          description:
            form.description.trim() || null,
          event_type:
            form.event_type.trim() || null,
          celebrity_id:
            form.celebrity_id || null,
          image_url:
            form.image_url.trim() || null,
          event_date: form.event_date,
          start_time:
            form.start_time || null,
          end_time:
            form.end_time || null,
          venue: form.venue.trim(),
          address:
            form.address.trim() || null,
          city:
            form.city.trim() || null,
          country:
            form.country.trim() || null,
          capacity:
            form.capacity
              ? Number(form.capacity)
              : null,
          ticket_price:
            form.ticket_price
              ? Number(form.ticket_price)
              : null,
          ticket_currency:
            form.ticket_currency || "USD",
          ticket_url:
            form.ticket_url.trim() || null,
          status: form.status,
          featured: form.featured,
          public_visible:
            form.status === "published"
              ? form.public_visible
              : false,
        })
        .eq("id", eventId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Event updated successfully.");

      setTimeout(() => {
        router.push("/management/events");
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-black/10 bg-white p-10">
            <p className="text-sm text-black/50">
              Loading event...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-200 bg-white p-10">
            <h1 className="text-xl font-semibold">
              Unable to load event
            </h1>

            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>

            <Link
              href="/management/events"
              className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/management/events"
              className="text-sm text-black/50 hover:text-black"
            >
              ← Back to Events
            </Link>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Edit Event
            </h1>

            <p className="mt-1 text-sm text-black/50">
              Update event information and publishing settings.
            </p>
          </div>

          <Link
            href={`/events/${form.slug}`}
            target="_blank"
            className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            View Public Page ↗
          </Link>
        </div>

        {/* ALERTS */}
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Main information displayed for the event.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Event Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) => {
                    updateField(
                      "title",
                      e.target.value
                    );

                    if (!form.slug) {
                      updateField(
                        "slug",
                        createSlug(e.target.value)
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="Celebrity Live Experience"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      createSlug(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="celebrity-live-experience"
                />

                <p className="mt-2 text-xs text-black/40">
                  Used in the public event URL.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Type
                </label>

                <select
                  value={form.event_type}
                  onChange={(e) =>
                    updateField(
                      "event_type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="">
                    Select type
                  </option>
                  <option value="Concert">
                    Concert
                  </option>
                  <option value="Meet & Greet">
                    Meet & Greet
                  </option>
                  <option value="Private Event">
                    Private Event
                  </option>
                  <option value="Festival">
                    Festival
                  </option>
                  <option value="Conference">
                    Conference
                  </option>
                  <option value="Charity">
                    Charity
                  </option>
                  <option value="Appearance">
                    Appearance
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Celebrity
                </label>

                <select
                  value={form.celebrity_id}
                  onChange={(e) =>
                    updateField(
                      "celebrity_id",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="">
                    No specific celebrity
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
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={6}
                  className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="Describe the event..."
                />
              </div>
            </div>
          </section>

          {/* DATE & LOCATION */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Date & Location
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Date
                </label>

                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) =>
                    updateField(
                      "event_date",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start Time
                </label>

                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    updateField(
                      "start_time",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  End Time
                </label>

                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    updateField(
                      "end_time",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Capacity
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.capacity}
                  onChange={(e) =>
                    updateField(
                      "capacity",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="5000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Venue
                </label>

                <input
                  value={form.venue}
                  onChange={(e) =>
                    updateField(
                      "venue",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="Madison Square Garden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <input
                  value={form.address}
                  onChange={(e) =>
                    updateField(
                      "address",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="4 Pennsylvania Plaza"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  City
                </label>

                <input
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Country
                </label>

                <input
                  value={form.country}
                  onChange={(e) =>
                    updateField(
                      "country",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="United States"
                />
              </div>
            </div>
          </section>

          {/* TICKETS */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Ticket Information
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ticket Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ticket_price}
                  onChange={(e) =>
                    updateField(
                      "ticket_price",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Currency
                </label>

                <select
                  value={form.ticket_currency}
                  onChange={(e) =>
                    updateField(
                      "ticket_currency",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="USD">
                    USD
                  </option>
                  <option value="EUR">
                    EUR
                  </option>
                  <option value="GBP">
                    GBP
                  </option>
                  <option value="NGN">
                    NGN
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ticket URL
                </label>

                <input
                  type="url"
                  value={form.ticket_url}
                  onChange={(e) =>
                    updateField(
                      "ticket_url",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
                  placeholder="https://tickets.example.com"
                />
              </div>
            </div>
          </section>

          {/* IMAGE */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Event Image
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Upload a new image or keep the existing one.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Upload New Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    handleImageChange(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                />

                {uploading && (
                  <p className="mt-3 text-sm text-black/50">
                    Uploading image...
                  </p>
                )}
              </div>

              <div>
                {form.image_url ? (
                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Current Image
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-black/10">
                      <img
                        src={form.image_url}
                        alt={form.title}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02]">
                    <p className="text-sm text-black/40">
                      No event image
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PUBLISHING */}
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Publishing
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Control the event status and public visibility.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value as EventForm["status"]
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 p-4">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    updateField(
                      "featured",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <div>
                  <p className="text-sm font-medium">
                    Featured Event
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Highlight this event on the public site.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 p-4">
                <input
                  type="checkbox"
                  checked={form.public_visible}
                  disabled={form.status !== "published"}
                  onChange={(e) =>
                    updateField(
                      "public_visible",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <div>
                  <p className="text-sm font-medium">
                    Public Visibility
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Show this event on the public Events page.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/management/events"
              className="rounded-xl border border-black/10 bg-white px-6 py-3 text-center text-sm font-medium hover:bg-black/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}