import { useState } from "react";
import { User, Mail, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [saving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
  updateUser(form);
  toast.success("Profile updated");
  setIsEditing(false);
};


  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-8">Profile</h2>

      <div className="rounded-2xl border bg-white p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-semibold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <h3 className="text-lg font-semibold">{user?.username}</h3>
            <p className="text-sm text-slate-500">Account Settings</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!isEditing}
              className="
                w-full pl-10 pr-4 h-11 rounded-lg border
                disabled:bg-slate-100
              "
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="email"
              value={form.email}
              disabled
              className="w-full pl-10 pr-4 h-11 rounded-lg border bg-slate-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 h-11 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  px-5 h-11 rounded-lg
                  bg-emerald-500 text-white
                  flex items-center gap-2
                  disabled:opacity-50
                "
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 h-11 rounded-lg bg-slate-900 text-white"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
