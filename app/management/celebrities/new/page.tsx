"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "Actor",
  "Recording Artist",
  "Athlete",
  "Musician",
  "Television Personality",
  "Other",
];

export default function NewCelebrityPage() {
  const supabase = createClient();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Actor",
    imageUrl: "",
    biography: "",
    location: "",
    dateOfBirth: "",
    maritalStatus: "",
    managementStatus: "active",
    verified: false,
    bookingAvailable: true,
    featured: false,
    instagram: "",
    twitter: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;

    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function createSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

console.log("CURRENT SUPABASE USER:", user);
console.log("CURRENT SUPABASE USER ERROR:", userError);

    setError("");

    if (!form.name.trim()) {
      setError("Celebrity name is required.");
      return;
    }

    setSaving(true);

    const slug = createSlug(form.name);

    const { error: insertError } = await supabase
      .from("celebrities")
      .insert({
        name: form.name.trim(),
        slug,
        category: form.category,
        image_url: form.imageUrl.trim() || null,
        biography: form.biography.trim() || null,
        location: form.location.trim() || null,
        date_of_birth: form.dateOfBirth || null,
        marital_status: form.maritalStatus.trim() || null,
        management_status: form.managementStatus,
        verified: form.verified,
        booking_available: form.bookingAvailable,
        featured: form.featured,
        social_instagram: form.instagram.trim() || null,
        social_twitter: form.twitter.trim() || null,
        social_facebook: form.facebook.trim() || null,
        social_tiktok: form.tiktok.trim() || null,
        social_youtube: form.youtube.trim() || null,
      });

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/management/celebrities");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-black">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-10">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/40">
              Talent Management
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Add Celebrity
            </h1>
          </div>

          <Link
            href="/management/celebrities"
            className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
          >
            Back to Talent
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-2xl border border-black/10 bg-white p-6 lg:p-8">
            <SectionHeading
              title="Basic Information"
              description="The main information displayed on the celebrity profile."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField
                label="Celebrity Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sophie Cunningham"
                required
              />

              <SelectField
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={categories}
              />

              <InputField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Los Angeles, California"
              />

              <InputField
                label="Profile Image URL"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
                Biography
              </label>

              <textarea
                name="biography"
                value={form.biography}
                onChange={handleChange}
                rows={7}
                placeholder="Write the celebrity biography..."
                className="w-full resize-none rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-black"
              />
            </div>
          </section>

          {/* Personal Information */}
          <section className="rounded-2xl border border-black/10 bg-white p-6 lg:p-8">
            <SectionHeading
              title="Personal Information"
              description="Optional information used for the celebrity profile."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
              />

              <InputField
                label="Marital Status"
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
                placeholder="e.g. Married"
              />
            </div>
          </section>

          {/* Management Settings */}
          <section className="rounded-2xl border border-black/10 bg-white p-6 lg:p-8">
            <SectionHeading
              title="Management Settings"
              description="Control how this celebrity is managed and displayed."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <SelectField
                label="Management Status"
                name="managementStatus"
                value={form.managementStatus}
                onChange={handleChange}
                options={["active", "inactive", "pending"]}
              />
            </div>

            <div className="mt-6 space-y-3">
              <ToggleField
                name="verified"
                checked={form.verified}
                onChange={handleChange}
                title="Verified Celebrity"
                description="Display the verified badge on the celebrity profile."
              />

              <ToggleField
                name="bookingAvailable"
                checked={form.bookingAvailable}
                onChange={handleChange}
                title="Available for Booking"
                description="Allow this celebrity to appear as available for booking."
              />

              <ToggleField
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                title="Featured Celebrity"
                description="Feature this celebrity in highlighted talent sections."
              />
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-2xl border border-black/10 bg-white p-6 lg:p-8">
            <SectionHeading
              title="Social Media"
              description="Add the celebrity's official social media profiles."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />

              <InputField
                label="X / Twitter"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                placeholder="https://x.com/..."
              />

              <InputField
                label="Facebook"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />

              <InputField
                label="TikTok"
                name="tiktok"
                value={form.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
              />

              <InputField
                label="YouTube"
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
              />
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/management/celebrities"
              className="rounded-full border border-black/10 bg-white px-7 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Celebrity"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Section Heading
------------------------------------------------------- */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <p className="mt-1 text-sm leading-6 text-black/45">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Input
------------------------------------------------------- */

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-black"
      />
    </div>
  );
}

/* -------------------------------------------------------
   Select
------------------------------------------------------- */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-sm outline-none transition focus:border-black"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* -------------------------------------------------------
   Toggle
------------------------------------------------------- */

function ToggleField({
  name,
  checked,
  onChange,
  title,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-black/10 bg-[#f8f8f6] p-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs leading-5 text-black/45">
          {description}
        </p>
      </div>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <span className="block h-6 w-11 rounded-full bg-black/15 transition peer-checked:bg-black" />

        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}