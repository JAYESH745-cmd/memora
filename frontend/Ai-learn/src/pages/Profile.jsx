import React, { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Edit3,
  Mail,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  const initials = (user?.username || user?.email || "U").slice(0, 1).toUpperCase();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    updateUser(form);
    toast.success("Profile updated");
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <BadgeCheck size={14} />
              Account profile
            </div>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-950 text-3xl font-bold text-white shadow-sm">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-950">
                  {user?.username || "Your profile"}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Manage your account identity and keep your learning workspace personalized.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
              <ShieldCheck size={25} />
            </div>
            <h2 className="mt-5 text-xl font-bold">Secure learning space</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Your documents, flashcards, quizzes, and progress stay tied to this account.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Account details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the name shown across your workspace.
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Edit3 size={16} />
                Edit profile
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <Field
              icon={User}
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <Field
              icon={Mail}
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled
              helper="Email changes are disabled in this version."
            />
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <InfoCard
            icon={Mail}
            label="Signed in as"
            value={user?.email || "No email available"}
          />
          <InfoCard
            icon={Calendar}
            label="Account status"
            value="Active"
          />
          <InfoCard
            icon={ShieldCheck}
            label="Workspace access"
            value="Private"
          />
        </div>
      </section>
    </div>
  );
};

const Field = ({ icon, label, helper, ...inputProps }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <div className="relative mt-2">
      {React.createElement(icon, {
        className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
      })}
      <input
        {...inputProps}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
    {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {React.createElement(icon, { size: 18 })}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  </div>
);

export default Profile;
