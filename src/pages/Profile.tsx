import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../services/apiClient";
import type { User } from "../types/auth.types";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return err.response?.data?.message || err.message || fallback;
  }

  return fallback;
};

const Profile = () => {
  const [formData, setFormData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.users.getProfile();
        setFormData(response);
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      try {
        setIsLoading(true);
        const updatedUser = await apiClient.users.uploadAvatar(file);
        setFormData(updatedUser);
      } catch (err) {
        toast.error("Failed to upload image");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!formData) return;
    try {
      setIsLoading(true);
      const updatedUser = await apiClient.users.updateProfile({
        name: formData.name,
      });
      setFormData(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save changes"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPasswordForm = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.auth.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setIsChangingPassword(false);
      resetPasswordForm();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to change password"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-(--bg) pt-10 text-(--text)">
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl shadow-sm p-8 flex justify-center items-center">
            <div className="text-(--text)">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) pt-20 text-(--text)">
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-(--bg-card) border border-(--border) rounded-2xl shadow-sm">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-(--text-heading) mb-4">
              Profile
            </h2>

            <div className="flex flex-col md:flex-row md:items-start gap-16">
              <div className="mb-8 md:mb-0">
                <label className="block text-sm font-medium text-(--text) mb-4">
                  Profile picture
                </label>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Profile"
                        className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 "
                      />
                    ) : (
                      <div className="w-48 h-48 text-4xl rounded-full bg-primary text-bg-main flex items-center justify-center font-semibold border-4 border-gray-200">
                        {formData.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() =>
                          (
                            document.querySelector(
                              'input[type="file"]',
                            ) as HTMLInputElement
                          )?.click()
                        }
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera size={18} />
                        Change picture
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-2.5 text-(--text) disabled:bg-(--bg) disabled:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-2.5 text-(--text-muted) cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        formData.is_verified
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600 "
                      }`}
                    >
                      {formData.is_verified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {isChangingPassword && (
              <div className="mt-8 pt-8 border-t border-(--border) space-y-6">
                <h3 className="text-xl font-semibold text-(--text-heading)">
                  Change Password
                </h3>

                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Current password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-2.5 text-(--text) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-2.5 text-(--text) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full rounded-xl border border-(--border) bg-(--bg) px-4 py-2.5 text-(--text) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      resetPasswordForm();
                    }}
                    disabled={isLoading}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-(--text-muted) hover:bg-(--bg) transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-(--border)"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-8 border-t border-(--border)">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-(--text-muted) hover:bg-(--bg) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {isLoading ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsChangingPassword(true);
                    }}
                    disabled={isLoading || isChangingPassword}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-(--text-muted) hover:bg-(--bg) transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-(--border)"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
