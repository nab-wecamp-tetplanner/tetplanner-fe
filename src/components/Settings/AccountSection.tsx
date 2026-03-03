import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import apiClient from "../../services/apiClient";
import { useToast } from "../../hooks/useToast";
// import { useAuthContext } from "../../contexts/AuthTypes";
import type { User } from "../../types/auth.types";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AccountSectionProps {
  userData: User;
  setUserData: (user: User) => void;
}

const AccountSection = ({ userData }: AccountSectionProps) => {
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { success, error: showError } = useToast();
  // const { setCurrentUser } = useAuthContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (passwordError) setPasswordError("");
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      await apiClient.auth.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      success("Password updated successfully!");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to update password. Please check your current password.";
      setPasswordError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <ShieldCheck size={20} className="text-(--primary)" /> Account
          Security
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Update your email and password settings.
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <input
            name="email"
            value={userData.email}
            disabled={true}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold focus:border-(--primary) outline-none transition-all disabled:bg-stone-50 disabled:text-stone-400"
          />
        </div>

        {isEditing && (
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm outline-none focus:border-(--primary)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm outline-none focus:border-(--primary)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase">
                  Confirm New
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm outline-none focus:border-(--primary)"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-[10px] text-red-500 font-bold">
                {passwordError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-stone-50">
        {isEditing ? (
          <>
            <button
              onClick={() => {
                setIsEditing(false);
                setPasswordError("");
              }}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold text-stone-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-(--primary) text-white rounded-lg text-xs font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {isLoading ? "Updating..." : "Update Account"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-black transition-all"
          >
            Edit Account
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountSection;
