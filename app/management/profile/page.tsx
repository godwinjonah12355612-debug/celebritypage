"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tab = "overview" | "security" | "permissions" | "activity";

const permissions = [
  {
    name: "Celebrities",
    description: "Add, edit and manage celebrity profiles",
    enabled: true,
  },
  {
    name: "Members",
    description: "Manage registered members and accounts",
    enabled: true,
  },
  {
    name: "Fan Cards",
    description: "Review and manage fan card applications",
    enabled: true,
  },
  {
    name: "Bookings",
    description: "Manage celebrity booking requests",
    enabled: true,
  },
  {
    name: "Events",
    description: "Create and manage events",
    enabled: true,
  },
  {
    name: "Messages",
    description: "Manage member and celebrity conversations",
    enabled: true,
  },
  {
    name: "Documents",
    description: "Manage management documents",
    enabled: true,
  },
  {
    name: "Contracts",
    description: "Manage contracts and agreements",
    enabled: true,
  },
  {
    name: "Finance",
    description: "View and manage payments and finance",
    enabled: false,
  },
  {
    name: "Reports",
    description: "View management reports and analytics",
    enabled: true,
  },
];

const activities = [
  {
    action: "Signed in to management dashboard",
    time: "Recent",
    type: "Security",
  },
  {
    action: "Profile loaded from management account",
    time: "Recent",
    type: "Profile",
  },
];

export default function ManagementProfilePage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [userId, setUserId] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    displayName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    language: "English",
    role: "",
    status: "",
    createdAt: "",
    avatarUrl: "",
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Unable to load your authenticated account.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, display_name, email, phone, country, timezone, language, role, status, created_at, avatar_url"
        )
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setErrorMessage(
          error?.message || "Your management profile could not be found."
        );
        setLoading(false);
        return;
      }

      setProfile({
        fullName: data.full_name || "",
        displayName: data.display_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        country: data.country || "Nigeria",
        timezone: data.timezone || "Africa/Lagos",
        language: data.language || "English",
        role: data.role || "",
        status: data.status || "",
        createdAt: data.created_at || "",
        avatarUrl: data.avatar_url || "",
      });

      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateProfile(field: string, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  async function handleProfilePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !userId) return;

    setErrorMessage("");
    setSaved(false);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile photo must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setSaving(true);

    try {
      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${userId}/profile-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("PROFILE PHOTO UPLOAD ERROR:", uploadError);
        setErrorMessage(uploadError.message);
        setSaving(false);
        event.target.value = "";
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("PROFILE PHOTO DATABASE ERROR:", updateError);
        setErrorMessage(updateError.message);
        setSaving(false);
        event.target.value = "";
        return;
      }

      setProfile((current) => ({
        ...current,
        avatarUrl: publicUrl,
      }));

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("PROFILE PHOTO ERROR:", error);
      setErrorMessage("Unable to upload your profile photo.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  async function handleSave() {
    if (!userId) return;

    setSaving(true);
    setSaved(false);
    setErrorMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.fullName.trim(),
        display_name: profile.displayName.trim(),
        phone: profile.phone.trim(),
        country: profile.country,
        timezone: profile.timezone,
        language: profile.language,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function formatDate(date: string) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatLastLogin() {
    const date = new Date();

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const initials =
    profile.displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() ||
    profile.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() ||
    "AD";

  const roleLabel =
    profile.role === "super_admin"
      ? "Super Admin"
      : profile.role
        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
        : "Management";

  const statusLabel =
    profile.status === "active"
      ? "Active"
      : profile.status
        ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1)
        : "Unknown";

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-black">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#0b0b0b] text-white transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link href="/management" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-white/30 text-sm font-semibold">
              CM
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em]">
                CELEBRITY
              </p>
              <p className="text-[9px] tracking-[0.24em] text-white/50">
                MANAGEMENT
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Main
          </p>

          <div className="space-y-1">
            <SidebarLink href="/management" label="Dashboard" icon="⌂" />

            <SidebarLink
              href="/management/celebrities"
              label="Celebrities"
              icon="★"
            />

            <SidebarLink
              href="/management/members"
              label="Members"
              icon="♙"
            />

            <SidebarLink
              href="/management/fan-cards"
              label="Fan Cards"
              icon="▣"
              badge="18"
            />

            <SidebarLink
              href="/management/bookings"
              label="Bookings"
              icon="◫"
              badge="9"
            />

            <SidebarLink
              href="/management/events"
              label="Events"
              icon="◷"
            />

            <SidebarLink
              href="/management/messages"
              label="Messages"
              icon="◌"
              badge="4"
            />

            <SidebarLink
              href="/management/documents"
              label="Documents"
              icon="▤"
            />

            <SidebarLink
              href="/management/contracts"
              label="Contracts"
              icon="□"
            />

            <SidebarLink
              href="/management/finance"
              label="Payments & Finance"
              icon="$"
            />

            <SidebarLink
              href="/management/reports"
              label="Reports"
              icon="▥"
            />
          </div>

          <p className="mb-3 mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Account
          </p>

          <div className="space-y-1">
            <SidebarLink
              href="/management/profile"
              label="My Profile"
              icon="●"
              active
            />

            <SidebarLink
              href="/management/settings"
              label="Settings"
              icon="⚙"
            />
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
            <span className="text-base">↪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:pl-[270px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/5 bg-[#f5f5f2]/90 px-5 backdrop-blur md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Management
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                My Profile
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white">
              ♧
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-black" />
            </button>

            <div className="hidden items-center gap-3 border-l border-black/10 pl-4 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black text-xs font-semibold text-white">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || "Profile photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{loading ? "..." : initials}</span>
                )}
              </div>

              <div className="hidden md:block">
                <p className="text-xs font-semibold">
                  {loading
                    ? "Loading..."
                    : profile.displayName ||
                      profile.fullName ||
                      "Administrator"}
                </p>

                <p className="text-[10px] text-black/40">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8 lg:px-10">
          {errorMessage && (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Profile header */}
          <section className="rounded-2xl border border-black/5 bg-white p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-black text-xl font-semibold text-white">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName || "Profile photo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{loading ? "..." : initials}</span>
                    )}
                  </div>

                  <label
                    htmlFor="profile-photo-header"
                    title="Change profile photo"
                    className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black text-sm font-bold text-white shadow-md transition hover:bg-black/80"
                  >
                    +
                  </label>

                  <input
                    id="profile-photo-header"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfilePhotoUpload}
                    disabled={saving || loading}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {loading
                        ? "Loading..."
                        : profile.fullName ||
                          profile.displayName ||
                          "Administrator"}
                    </h2>

                    <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
                      {roleLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-black/45">
                    {loading ? "Loading..." : profile.email || "—"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1.5 text-black/55">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          profile.status === "active"
                            ? "bg-green-500"
                            : "bg-black/20"
                        }`}
                      />

                      {statusLabel} account
                    </span>

                    <span className="text-black/20">•</span>

                    <span className="text-black/45">
                      User ID: {loading ? "Loading..." : userId || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                  Current session
                </p>

                <p className="mt-1 text-sm font-medium">
                  {loading ? "Loading..." : formatLastLogin()}
                </p>

                <p className="text-xs text-black/40">
                  Authenticated session
                </p>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="mt-6 overflow-x-auto border-b border-black/10">
            <div className="flex min-w-max gap-6">
              <TabButton
                label="Overview"
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              />

              <TabButton
                label="Security"
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
              />

              <TabButton
                label="Permissions"
                active={activeTab === "permissions"}
                onClick={() => setActiveTab("permissions")}
              />

              <TabButton
                label="Activity"
                active={activeTab === "activity"}
                onClick={() => setActiveTab("activity")}
              />
            </div>
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <section className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-black/5 bg-white p-6 md:p-8">
                  {/* Profile Photo */}
                  <div className="mb-8 rounded-2xl border border-black/5 bg-[#fafaf8] p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-2xl font-semibold text-white">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName || "Profile photo"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          Profile Photo
                        </p>

                        <p className="mt-1 text-xs leading-5 text-black/40">
                          Upload a professional photo for your management
                          profile. JPG, PNG or WebP. Maximum size 5MB.
                        </p>

                        <label
                          htmlFor="profile-photo-main"
                          className="mt-4 inline-flex cursor-pointer rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-black/80"
                        >
                          {saving ? "Uploading..." : "Upload Photo"}
                        </label>

                        <input
                          id="profile-photo-main"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleProfilePhotoUpload}
                          disabled={saving || loading}
                        />

                        {profile.avatarUrl && (
                          <p className="mt-2 text-[10px] text-green-600">
                            Profile photo uploaded successfully.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-7">
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>

                    <p className="mt-1 text-xs text-black/40">
                      Update the information associated with your management
                      account.
                    </p>
                  </div>

                  {loading ? (
                    <div className="py-10 text-center text-sm text-black/40">
                      Loading profile...
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-5 md:grid-cols-2">
                        <InputField
                          label="Full Name"
                          value={profile.fullName}
                          onChange={(value) =>
                            updateProfile("fullName", value)
                          }
                        />

                        <InputField
                          label="Display Name"
                          value={profile.displayName}
                          onChange={(value) =>
                            updateProfile("displayName", value)
                          }
                        />

                        <InputField
                          label="Email Address"
                          value={profile.email}
                          onChange={(value) =>
                            updateProfile("email", value)
                          }
                          type="email"
                          disabled
                        />

                        <InputField
                          label="Phone Number"
                          value={profile.phone}
                          onChange={(value) =>
                            updateProfile("phone", value)
                          }
                        />

                        <SelectField
                          label="Country"
                          value={profile.country}
                          options={[
                            "Nigeria",
                            "United Kingdom",
                            "United States",
                            "Canada",
                          ]}
                          onChange={(value) =>
                            updateProfile("country", value)
                          }
                        />

                        <SelectField
                          label="Time Zone"
                          value={profile.timezone}
                          options={[
                            "Africa/Lagos",
                            "Europe/London",
                            "America/New_York",
                            "America/Los_Angeles",
                          ]}
                          onChange={(value) =>
                            updateProfile("timezone", value)
                          }
                        />

                        <SelectField
                          label="Preferred Language"
                          value={profile.language}
                          options={["English", "French", "Spanish"]}
                          onChange={(value) =>
                            updateProfile("language", value)
                          }
                        />
                      </div>

                      <div className="mt-7 flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-black/40">
                          Profile changes will be saved to your account.
                        </p>

                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="rounded-xl bg-black px-6 py-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving
                            ? "Saving..."
                            : saved
                              ? "Changes Saved"
                              : "Save Changes"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-6">
                  <InfoCard
                    title="Management Role"
                    value={loading ? "Loading..." : roleLabel}
                    description="Your management role is controlled by the platform."
                  />

                  <InfoCard
                    title="Account Status"
                    value={loading ? "Loading..." : statusLabel}
                    description="Your account status is controlled by the platform."
                    status={profile.status === "active"}
                  />

                  <InfoCard
                    title="Member Since"
                    value={
                      loading
                        ? "Loading..."
                        : formatDate(profile.createdAt)
                    }
                    description="Your management account creation date."
                  />
                </div>
              </div>
            </section>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <section className="mt-6 space-y-5">
              <SecurityCard
                title="Password"
                description="Change the password used to access the management dashboard."
                action="Change Password"
              />

              <SecurityCard
                title="Two-Factor Authentication"
                description="Add another layer of security to your management account."
                action="Set Up 2FA"
                badge="Not Enabled"
              />

              <SecurityCard
                title="Active Sessions"
                description="Review devices currently signed in to your management account."
                action="View Sessions"
              />

              <SecurityCard
                title="Login History"
                description="Review recent login activity for your account."
                action="View History"
              />
            </section>
          )}

          {/* Permissions */}
          {activeTab === "permissions" && (
            <section className="mt-6">
              <div className="rounded-2xl border border-black/5 bg-white p-6 md:p-8">
                <div className="mb-7">
                  <h3 className="text-lg font-semibold">
                    Account Permissions
                  </h3>

                  <p className="mt-1 text-xs text-black/40">
                    These permissions are controlled by your management role.
                  </p>
                </div>

                <div className="divide-y divide-black/5">
                  {permissions.map((permission) => (
                    <div
                      key={permission.name}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {permission.name}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {permission.description}
                        </p>
                      </div>

                      <div
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider ${
                          permission.enabled
                            ? "bg-black text-white"
                            : "bg-black/5 text-black/35"
                        }`}
                      >
                        {permission.enabled ? "Enabled" : "Restricted"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Activity */}
          {activeTab === "activity" && (
            <section className="mt-6">
              <div className="rounded-2xl border border-black/5 bg-white p-6 md:p-8">
                <div className="mb-7">
                  <h3 className="text-lg font-semibold">
                    Recent Activity
                  </h3>

                  <p className="mt-1 text-xs text-black/40">
                    A record of recent actions performed by this account.
                  </p>
                </div>

                <div className="space-y-1">
                  {activities.map((activity, index) => (
                    <div
                      key={`${activity.action}-${index}`}
                      className="flex gap-4 rounded-xl px-3 py-4 transition hover:bg-black/[0.02]"
                    >
                      <div className="relative flex w-6 justify-center">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-black" />

                        {index !== activities.length - 1 && (
                          <span className="absolute left-1/2 top-5 h-full w-px -translate-x-1/2 bg-black/10" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>

                          <span className="text-[10px] text-black/35">
                            {activity.time}
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-black/35">
                          {activity.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  badge,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
        active
          ? "bg-white text-black"
          : "text-white/55 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="flex w-5 justify-center text-xs">
          {icon}
        </span>

        {label}
      </span>

      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
            active
              ? "bg-black text-white"
              : "bg-white/10 text-white/60"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-1 pb-4 text-xs font-semibold transition ${
        active
          ? "border-black text-black"
          : "border-transparent text-black/35 hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-black disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/45"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/40">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition focus:border-black"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({
  title,
  value,
  description,
  status = false,
}: {
  title: string;
  value: string;
  description: string;
  status?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
        {title}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {status && (
          <span className="h-2 w-2 rounded-full bg-green-500" />
        )}

        <p className="text-lg font-semibold">{value}</p>
      </div>

      <p className="mt-2 text-xs leading-5 text-black/40">
        {description}
      </p>
    </div>
  );
}

function SecurityCard({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description: string;
  action: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-7">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold">{title}</h3>

          {badge && (
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-black/40">
              {badge}
            </span>
          )}
        </div>

        <p className="mt-2 max-w-2xl text-xs leading-5 text-black/40">
          {description}
        </p>
      </div>

      <button className="shrink-0 rounded-xl border border-black/10 px-5 py-3 text-xs font-semibold transition hover:bg-black hover:text-white">
        {action}
      </button>
    </div>
  );
}