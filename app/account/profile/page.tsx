"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
  role: string;
  status: string;
  avatar_url: string | null;
};

export default function MemberProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(
          `/member/login?redirect=${encodeURIComponent(
            "/account/profile"
          )}`
        );
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          display_name,
          email,
          phone,
          country,
          timezone,
          language,
          role,
          status,
          avatar_url
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        console.error("PROFILE LOAD ERROR:", error);

        setErrorMessage(
          "Your profile could not be loaded."
        );

        setLoading(false);
        return;
      }

      const currentProfile = data as Profile;

      setProfile(currentProfile);

      setFullName(currentProfile.full_name || "");
      setDisplayName(currentProfile.display_name || "");
      setPhone(currentProfile.phone || "");
      setCountry(currentProfile.country || "Nigeria");
      setTimezone(
        currentProfile.timezone || "Africa/Lagos"
      );
      setLanguage(
        currentProfile.language || "English"
      );

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Your profile photo must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setUploadingPhoto(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUploadingPhoto(false);
      event.target.value = "";

      router.replace(
        `/member/login?redirect=${encodeURIComponent(
          "/account/profile"
        )}`
      );

      return;
    }

    /*
      Every member gets their own folder.

      Example:

      avatars/
        USER-ID/
          avatar
    */

    const filePath = `${user.id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(
        "PROFILE PHOTO UPLOAD ERROR:",
        uploadError
      );

      setErrorMessage(
        "We could not upload your photo. Please try again."
      );

      setUploadingPhoto(false);
      event.target.value = "";
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      setErrorMessage(
        "The photo was uploaded, but we could not create its profile URL."
      );

      setUploadingPhoto(false);
      event.target.value = "";
      return;
    }

    /*
      Add a timestamp so the browser does not keep showing
      the previous cached profile photo.
    */
    const avatarUrl = `${
      publicUrlData.publicUrl
    }?v=${Date.now()}`;

    const { data: updatedProfile, error: updateError } =
      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(`
          id,
          full_name,
          display_name,
          email,
          phone,
          country,
          timezone,
          language,
          role,
          status,
          avatar_url
        `)
        .single();

    if (updateError) {
      console.error(
        "PROFILE PHOTO DATABASE UPDATE ERROR:",
        updateError
      );

      setErrorMessage(
        "The photo was uploaded, but your profile could not be updated."
      );

      setUploadingPhoto(false);
      event.target.value = "";
      return;
    }

    setProfile(updatedProfile as Profile);

    setMessage(
      "Your profile photo has been updated successfully."
    );

    setUploadingPhoto(false);
    event.target.value = "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);

      router.replace(
        `/member/login?redirect=${encodeURIComponent(
          "/account/profile"
        )}`
      );

      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        display_name: displayName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || "Nigeria",
        timezone,
        language,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(`
        id,
        full_name,
        display_name,
        email,
        phone,
        country,
        timezone,
        language,
        role,
        status,
        avatar_url
      `)
      .single();

    if (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      setErrorMessage(
        "We could not save your profile. Please try again."
      );

      setSaving(false);
      return;
    }

    setProfile(data as Profile);

    setFullName(data.full_name || "");
    setDisplayName(data.display_name || "");
    setPhone(data.phone || "");
    setCountry(data.country || "Nigeria");
    setTimezone(data.timezone || "Africa/Lagos");
    setLanguage(data.language || "English");

    setMessage(
      "Your profile has been updated successfully."
    );

    setSaving(false);
  }

  const memberName =
    profile?.display_name ||
    profile?.full_name ||
    "Member";

  const initials = memberName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] text-black">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />

            <p className="text-sm text-black/50">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f3]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/account"
            className="text-xl font-black tracking-tight"
          >
            CM<span className="text-black/40">.</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link
              href="/celebrities"
              className="transition hover:text-black/50"
            >
              Celebrities
            </Link>

            <Link
              href="/booking"
              className="transition hover:text-black/50"
            >
              Book a Celebrity
            </Link>

            <Link
              href="/fan-card/apply"
              className="transition hover:text-black/50"
            >
              Fan Card
            </Link>

            <Link
              href="/account"
              className="font-semibold"
            >
              Account
            </Link>
          </nav>

          <Link
            href="/account"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            My Account
          </Link>
        </div>
      </header>

      {/* HEADER */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
          <Link
            href="/account"
            className="text-sm font-medium text-black/45 transition hover:text-black"
          >
            ← Back to Account
          </Link>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              Member Area
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Your Profile
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-black/55">
              Keep your personal information up to date so we
              can manage your membership and booking requests
              correctly.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
        >
          {/* PROFILE PHOTO */}
          <div className="border-b border-black/10 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              Profile
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Profile Photo
            </h2>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={memberName}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-black/10"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-black text-3xl font-black text-white shadow-lg">
                    {initials || "M"}
                  </div>
                )}

                <label
                  htmlFor="profile-photo"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-black text-white shadow-md transition hover:bg-black/75"
                  title="Change profile photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>
                </label>

                <input
                  id="profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="sr-only"
                />
              </div>

              <div>
                <p className="text-base font-bold">
                  {memberName}
                </p>

                <p className="mt-1 max-w-lg text-sm leading-6 text-black/50">
                  Upload a clear photo of yourself. This photo
                  will also be used on your Celebrity Management
                  fan card.
                </p>

                <label
                  htmlFor="profile-photo"
                  className="mt-4 inline-flex cursor-pointer rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black/80"
                >
                  {uploadingPhoto
                    ? "Uploading Photo..."
                    : profile?.avatar_url
                    ? "Change Photo"
                    : "Upload Photo"}
                </label>

                <p className="mt-2 text-xs text-black/35">
                  JPG, PNG or WebP · Maximum 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="border-b border-black/10 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              Personal Information
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Basic Details
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Your full name"
                required
              />

              <Field
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="How you want to appear"
              />

              <div className="sm:col-span-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                    Email Address
                  </span>

                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3.5 text-sm text-black/50 outline-none"
                  />
                </label>

                <p className="mt-2 text-xs text-black/35">
                  Your email address is managed by your login
                  account and cannot be changed here.
                </p>
              </div>

              <Field
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="+234..."
              />

              <Field
                label="Country"
                value={country}
                onChange={setCountry}
                placeholder="Nigeria"
              />
            </div>
          </div>

          {/* PREFERENCES */}
          <div className="border-b border-black/10 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              Preferences
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Account Preferences
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                  Timezone
                </span>

                <select
                  value={timezone}
                  onChange={(event) =>
                    setTimezone(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black/40"
                >
                  <option value="Africa/Lagos">
                    Africa/Lagos
                  </option>

                  <option value="Europe/London">
                    Europe/London
                  </option>

                  <option value="America/New_York">
                    America/New_York
                  </option>

                  <option value="America/Los_Angeles">
                    America/Los_Angeles
                  </option>

                  <option value="Africa/Johannesburg">
                    Africa/Johannesburg
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                  Language
                </span>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-black/40"
                >
                  <option value="English">
                    English
                  </option>
                </select>
              </label>
            </div>
          </div>

          {/* ACCOUNT STATUS */}
          <div className="border-b border-black/10 bg-[#fafaf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              Account
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
                  Account Type
                </p>

                <p className="mt-2 text-sm font-semibold capitalize">
                  {profile?.role || "member"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/35">
                  Status
                </p>

                <span className="mt-2 inline-flex rounded-full bg-black px-3 py-1.5 text-xs font-bold capitalize text-white">
                  {profile?.status || "active"}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <Link
              href="/account"
              className="text-center text-sm font-semibold text-black/50 transition hover:text-black"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-black px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © 2026 Celebrity Management. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/terms"
              className="hover:text-black"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-black"
            >
              Privacy
            </Link>

            <Link
              href="/contact"
              className="hover:text-black"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/40"
      />
    </label>
  );
}