"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Celebrity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  biography: string | null;
  location: string | null;
  management_status: "active" | "inactive" | "pending";
  verified: boolean;
  booking_available: boolean;
  featured: boolean;
  date_of_birth: string | null;
  marital_status: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
};

export default function EditCelebrityPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Actor",
    image_url: "",
    biography: "",
    location: "",
    date_of_birth: "",
    marital_status: "",
    management_status: "active",
    verified: false,
    booking_available: true,
    featured: false,
    social_instagram: "",
    social_twitter: "",
    social_facebook: "",
    social_tiktok: "",
    social_youtube: "",
  });

  /*
   * Load celebrity
   */
  useEffect(() => {
    async function loadCelebrity() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("celebrities")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error(error);

        setErrorMessage("Celebrity could not be found.");
        setLoading(false);

        return;
      }

      const celebrity = data as Celebrity;

      setForm({
        name: celebrity.name ?? "",
        category: celebrity.category ?? "Actor",
        image_url: celebrity.image_url ?? "",
        biography: celebrity.biography ?? "",
        location: celebrity.location ?? "",
        date_of_birth: celebrity.date_of_birth ?? "",
        marital_status: celebrity.marital_status ?? "",
        management_status: celebrity.management_status ?? "active",
        verified: celebrity.verified ?? false,
        booking_available: celebrity.booking_available ?? true,
        featured: celebrity.featured ?? false,
        social_instagram: celebrity.social_instagram ?? "",
        social_twitter: celebrity.social_twitter ?? "",
        social_facebook: celebrity.social_facebook ?? "",
        social_tiktok: celebrity.social_tiktok ?? "",
        social_youtube: celebrity.social_youtube ?? "",
      });

      setLoading(false);
    }

    if (id) {
      loadCelebrity();
    }
  }, [id]);

  /*
   * Handle normal form changes
   */
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  /*
   * Create slug from celebrity name
   */
  function createSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /*
   * Upload celebrity photo
   */
  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    /*
     * Validate file type
     */
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    /*
     * Maximum file size: 5MB
     */
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      /*
       * Get extension
       */
      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      /*
       * Create unique storage path
       *
       * Example:
       * celebrity-id/random-file.jpg
       */
      const filePath = `${id}/${crypto.randomUUID()}.${fileExtension}`;

      /*
       * Upload to Supabase Storage
       */
      const { error: uploadError } = await supabase.storage
        .from("celebrity-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);

        setErrorMessage(uploadError.message);
        return;
      }

      /*
       * Get public URL
       */
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("celebrity-images")
        .getPublicUrl(filePath);

      /*
       * Put URL into form.
       *
       * It will be saved to the celebrities table
       * when Save Changes is clicked.
       */
      setForm((current) => ({
        ...current,
        image_url: publicUrl,
      }));

      setSuccessMessage(
        "Photo uploaded successfully. Click Save Changes to save it to the profile."
      );
    } catch (error) {
      console.error("Unexpected upload error:", error);

      setErrorMessage(
        "Something went wrong while uploading the photo."
      );
    } finally {
      setUploadingImage(false);

      /*
       * Allow the user to select the same file again.
       */
      e.target.value = "";
    }
  }

  /*
   * Save celebrity changes
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.name.trim()) {
      setSaving(false);
      setErrorMessage("Celebrity name is required.");
      return;
    }

    const slug = createSlug(form.name);

    const { error } = await supabase
      .from("celebrities")
      .update({
        name: form.name.trim(),
        slug,
        category: form.category,
        image_url: form.image_url.trim() || null,
        biography: form.biography.trim() || null,
        location: form.location.trim() || null,
        date_of_birth: form.date_of_birth || null,
        marital_status: form.marital_status.trim() || null,
        management_status: form.management_status,
        verified: form.verified,
        booking_available: form.booking_available,
        featured: form.featured,
        social_instagram:
          form.social_instagram.trim() || null,
        social_twitter:
          form.social_twitter.trim() || null,
        social_facebook:
          form.social_facebook.trim() || null,
        social_tiktok:
          form.social_tiktok.trim() || null,
        social_youtube:
          form.social_youtube.trim() || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Update celebrity error:", error);

      setSaving(false);
      setErrorMessage(error.message);

      return;
    }

    setSaving(false);

    setSuccessMessage(
      "Celebrity profile updated successfully."
    );

    setTimeout(() => {
      router.push("/management/celebrities");
      router.refresh();
    }, 800);
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] text-black">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-black/50">
            Loading celebrity profile...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Celebrity not found
   */
  if (errorMessage && !form.name) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] text-black">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-semibold">
              Celebrity not found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {errorMessage}
            </p>

            <Link
              href="/management/celebrities"
              className="mt-6 inline-flex bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Back to Celebrities
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/40">
              Management
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Edit Celebrity
            </h1>
          </div>

          <Link
            href="/management/celebrities"
            className="border border-black/15 px-4 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            Back to Talent
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Messages */}
          {errorMessage && (
            <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Basic Information */}
          <section className="border border-black/10 bg-white p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
                Profile
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Basic Information
              </h2>

              <p className="mt-2 text-sm text-black/50">
                Update the celebrity&apos;s public profile
                information.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <Field label="Celebrity Name" required>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              {/* Category */}
              <Field label="Category">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option>Actor</option>
                  <option>Recording Artist</option>
                  <option>Athlete</option>
                  <option>Musician</option>
                </select>
              </Field>

              {/* Location */}
              <Field label="Location">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Los Angeles, California"
                  className={inputClass}
                />
              </Field>

              {/* Date of Birth */}
              <Field label="Date of Birth">
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              {/* Marital Status */}
              <Field label="Marital Status">
                <input
                  name="marital_status"
                  value={form.marital_status}
                  onChange={handleChange}
                  placeholder="e.g. Married"
                  className={inputClass}
                />
              </Field>

              {/* Profile Photo */}
              <Field label="Profile Photo">
                <div className="space-y-4">
                  {/* Image Preview */}
                  {form.image_url && (
                    <div className="overflow-hidden border border-black/10 bg-black/5">
                      <img
                        src={form.image_url}
                        alt={form.name || "Celebrity"}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Upload */}
                  <label
                    className={`flex cursor-pointer items-center justify-center border border-dashed border-black/20 bg-black/[0.02] px-5 py-8 text-center transition ${
                      uploadingImage
                        ? "cursor-not-allowed opacity-60"
                        : "hover:border-black/40 hover:bg-black/[0.04]"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">
                        {uploadingImage
                          ? "Uploading Photo..."
                          : "Upload New Photo"}
                      </div>

                      <div className="mt-1 text-xs text-black/45">
                        JPG, JPEG, PNG or WebP · Maximum 5MB
                      </div>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {/* URL fallback */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-black/50">
                      Or use an image URL
                    </label>

                    <input
                      name="image_url"
                      value={form.image_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </Field>
            </div>

            {/* Biography */}
            <div className="mt-6">
              <Field label="Biography">
                <textarea
                  name="biography"
                  value={form.biography}
                  onChange={handleChange}
                  rows={7}
                  className={inputClass}
                  placeholder="Write a professional biography..."
                />
              </Field>
            </div>
          </section>

          {/* Management */}
          <section className="border border-black/10 bg-white p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
                Management
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Status &amp; Availability
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Status */}
              <Field label="Management Status">
                <select
                  name="management_status"
                  value={form.management_status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </Field>

              {/* Toggles */}
              <div className="space-y-4 pt-7">
                <Checkbox
                  name="verified"
                  checked={form.verified}
                  onChange={handleChange}
                  label="Verified Celebrity"
                  description="Show the verified badge."
                />

                <Checkbox
                  name="booking_available"
                  checked={form.booking_available}
                  onChange={handleChange}
                  label="Available for Booking"
                  description="Allow booking requests for this celebrity."
                />

                <Checkbox
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  label="Featured Celebrity"
                  description="Show this celebrity in featured areas."
                />
              </div>
            </div>
          </section>

          {/* Social Profiles */}
          <section className="border border-black/10 bg-white p-6 sm:p-8">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
                Social
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Social Profiles
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Instagram */}
              <Field label="Instagram">
                <input
                  name="social_instagram"
                  value={form.social_instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className={inputClass}
                />
              </Field>

              {/* Twitter */}
              <Field label="Twitter / X">
                <input
                  name="social_twitter"
                  value={form.social_twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                  className={inputClass}
                />
              </Field>

              {/* Facebook */}
              <Field label="Facebook">
                <input
                  name="social_facebook"
                  value={form.social_facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className={inputClass}
                />
              </Field>

              {/* TikTok */}
              <Field label="TikTok">
                <input
                  name="social_tiktok"
                  value={form.social_tiktok}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@..."
                  className={inputClass}
                />
              </Field>

              {/* YouTube */}
              <Field label="YouTube">
                <input
                  name="social_youtube"
                  value={form.social_youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/management/celebrities"
              className="border border-black/15 bg-white px-6 py-3.5 text-center text-sm font-medium transition hover:bg-black/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : uploadingImage
                  ? "Uploading Photo..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

/*
 * Shared input styling
 */
const inputClass =
  "w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black";

/*
 * Form field
 */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/*
 * Checkbox
 */
function Checkbox({
  name,
  checked,
  onChange,
  label,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-black"
      />

      <span>
        <span className="block text-sm font-medium">
          {label}
        </span>

        <span className="mt-1 block text-xs text-black/45">
          {description}
        </span>
      </span>
    </label>
  );
}