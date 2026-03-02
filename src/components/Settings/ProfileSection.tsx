import { useEffect, useState } from "react";
import {
  Camera,
  Trash2,
  Save,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import type { User } from "../../types/auth.types";
import { useAuthContext } from "../../contexts/AuthTypes";

const ProfileSection = () => {
  // --- GIỮ NGUYÊN LOGIC ---
  const [formData, setFormData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { setCurrentUser } = useAuthContext(); // Lấy hàm từ Context

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      try {
        setIsLoading(true);
        setError(null);
        const updatedUser = await apiClient.users.uploadAvatar(file);
        setFormData(updatedUser);
        setCurrentUser(updatedUser);
      } catch {
        setError("Failed to upload image");
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
      setCurrentUser(updatedUser); // Đồng bộ Header
    } catch {
      setError("Failed to delete image"); // Đưa xuống catch mới đúng
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
      setCurrentUser(updatedUser); // THÊM DÒNG NÀY để Header cập nhật tên mới
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="p-8 flex flex-col justify-center items-center space-y-4">
        <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
        <div className="text-stone-400 text-sm font-medium animate-pulse">
          Refining profile...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header - Thu nhỏ size chữ và margin */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          Public Profile
        </h2>
        <p className="text-stone-500 text-sm font-medium">
          Manage how others see you.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 shadow-sm">
          <AlertCircle size={18} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Picture Section - Resize padding, rounded, avatar */}
        <section className="bg-white p-6 rounded-[1.5rem] border border-stone-100 shadow-lg shadow-stone-200/30">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative group mx-auto md:mx-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-(--primary) to-orange-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Profile"
                  className="relative w-28 h-28 rounded-full object-cover ring-2 ring-white shadow-xl"
                />
              ) : (
                <div className="relative w-28 h-28 text-3xl rounded-full bg-gradient-to-tr from-stone-800 to-stone-600 text-white flex items-center justify-center font-black ring-2 ring-white shadow-xl">
                  {formData.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Your Photo
                </h3>
                <p className="text-xs text-stone-500">
                  JPG, PNG or GIF. Max size of 2MB.
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
                    <Camera size={14} /> Change
                  </div>
                </label>
                <button
                  onClick={handleDeleteImage}
                  disabled={isLoading || !formData.image_url}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all disabled:opacity-30 border border-transparent hover:border-red-50"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Fields Section - Resize gap và padding input */}
        <section className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-bold
                  ${
                    isEditing
                      ? "border-stone-200 bg-white focus:ring-2 focus:ring-(--primary)/10 focus:border-(--primary) shadow-sm"
                      : "border-stone-100 bg-stone-50 text-stone-500 cursor-not-allowed"
                  }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50/50 text-stone-400 text-sm font-bold cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          {/* Verification Status - Gọn lại */}
          <div className="pt-4 border-t border-stone-50">
            <div className="flex items-center justify-between p-4 bg-stone-50/50 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${formData.is_verified ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
                >
                  <CheckCircle size={16} />
                </div>
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Account Status
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                ${formData.is_verified ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
              >
                {formData.is_verified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions - Resize padding và margin top */}
      <div className="flex justify-end items-center gap-3 mt-10 pt-6 border-t border-stone-100">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 text-xs font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-(--primary) to-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={16} /> Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-8 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-stone-900/10 hover:bg-black active:scale-95 transition-all"
          >
            <UserIcon size={16} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
