import { useEffect, useState } from "react";
import { Camera, Trash2, Save } from "lucide-react";
import apiClient from "../../services/apiClient";
import type { User } from "../../types/auth.types";

const ProfileSection = () => {
  const [formData, setFormData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.users.getProfile();
        setFormData(response);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const [isEditing, setIsEditing] = useState(false);

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
        setError(null);
        const updatedUser = await apiClient.users.uploadAvatar(file);
        setFormData(updatedUser);
      } catch (err) {
        setError("Failed to upload image");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!formData) return;
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await apiClient.users.updateProfile({
        image_url: "",
      });
      setFormData(updatedUser);
    } catch (err) {
      setError("Failed to delete image");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData) return;
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await apiClient.users.updateProfile({
        name: formData.name,
      });
      setFormData(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save changes";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-(--text)">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-(--text-heading) mb-8">Profile</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-(--text) mb-4">
          Profile picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            {formData.image_url ? (
              <img
                src={formData.image_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 "
              />
            ) : (
              <div className="w-32 h-32 text-4xl rounded-full bg-primary text-bg-main flex items-center justify-center font-semibold border-4 border-gray-200">
                {formData.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
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
                className="flex items-center gap-2 px-4 py-2 bg-(--primary) hover:bg-(--primary-light) text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={18} />
                Change picture
              </button>
            </label>
            <button
              onClick={handleDeleteImage}
              disabled={isLoading || !formData.image_url}
              className="flex items-center gap-2 px-4 py-2 bg-(--danger) hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Delete picture
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name */}
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
            className="w-full px-4 py-2 border border-gray-500  rounded-lg bg-(--secondary-light)/20 text-(--text-muted)  disabled:bg-(--secondary-light)/20 disabled:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-(--text) mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 border border-gray-500 dark:border-gray-600 rounded-lg bg-(--secondary-light)/20 text-(--text-muted) cursor-not-allowed"
          />
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-(--text) mb-2">
            Account Status
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.is_verified
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {formData.is_verified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-(--primary) hover:bg-(--primary-light)"
            >
              <Save size={18} />
              {isLoading ? "Saving..." : "Save changes"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-(--primary) hover:bg-(--primary-light)"
          >
            <Save size={18} />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
