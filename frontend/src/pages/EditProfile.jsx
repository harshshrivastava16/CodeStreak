import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/users/profile/${user._id}`);
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");

        const backendBaseUrl = "http://localhost:5000";
        let photoUrl = res.data.photo || "";
        if (photoUrl && !photoUrl.startsWith("http")) {
          photoUrl = backendBaseUrl + photoUrl;
        }
        setPhotoUrl(photoUrl);

        setLeetcodeUsername(res.data.platforms?.find(p => p.platform === 'leetcode')?.username || "");
      } catch {
        setStatus("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setSaving(true);
    try {
      if (leetcodeUsername) {
        const validateRes = await axiosInstance.get(
          `/users/validate/leetcode/${leetcodeUsername}`
        );
        if (!validateRes.data.valid) {
          setStatus("Invalid or not found LeetCode user");
          setSaving(false);
          return;
        }
      }

      if (name) {
        const res = await axiosInstance.get(`/users/search?query=${name}`);
        const nameExists = res.data.some(
          (u) => u.name === name && u._id !== user._id
        );
        if (nameExists) {
          setStatus("Username already taken");
          setSaving(false);
          return;
        }
      }

      const updateData = {
        name,
        email,
        phone,
        platforms: [],
      };
      if (leetcodeUsername) {
        updateData.platforms.push({
          platform: "leetcode",
          username: leetcodeUsername,
        });
      }

      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("platforms", JSON.stringify(updateData.platforms));
        formData.append("photo", photoFile);

        await axiosInstance.put(`/users/update-profile/${user._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.put(
          `/users/update-profile/${user._id}`,
          updateData
        );
      }

      setStatus(" Profile updated!");
      const updatedProfile = await axiosInstance.get(
        `/users/profile/${user._id}`
      );
      let updatedPhotoUrl = updatedProfile.data.photo || photoUrl;
      if (updatedPhotoUrl && !updatedPhotoUrl.startsWith("http")) {
        updatedPhotoUrl = "http://localhost:5000" + updatedPhotoUrl;
      }
      setUser((prevUser) => ({
        ...prevUser,
        name: updatedProfile.data.name || name,
        email: updatedProfile.data.email || email,
        phone: updatedProfile.data.phone || phone,
        photo: updatedProfile.data.photo || prevUser.photo,
      }));

      // Navigate back to profile after successful update
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch {
      setStatus("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#0D1117] dark group/design-root overflow-x-hidden" style={{ fontFamily: "Inter, 'Noto Sans', sans-serif" }}>
      {/* Header */}
     

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-3xl font-bold mb-8">Edit Profile</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-[#161b22] rounded-xl border border-[#30363d] p-8 space-y-6"
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={photoUrl || "/vite.svg"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--primary-color)]"
                />
                <label className="absolute bottom-0 right-0 bg-[var(--primary-color)] text-black px-3 py-1 text-sm rounded-full cursor-pointer shadow hover:scale-105 transition">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-400 text-sm">Click "Change" to update your profile picture</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* LeetCode Username */}
            <div>
              <label className="block text-white font-semibold mb-2">
                LeetCode Username
              </label>
              <input
                type="text"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-[#30363d] text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                placeholder="Enter your LeetCode username"
              />
              <p className="text-gray-400 text-sm mt-1">Optional: Connect your LeetCode account to track your progress</p>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-lg ${
                status.includes("")
                  ? "bg-green-600/20 border border-green-600/30 text-green-400"
                  : "bg-red-600/20 border border-red-600/30 text-red-400"
              }`}>
                <p className="text-center">{status}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-[var(--primary-color)] text-black font-bold shadow-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 py-3 rounded-lg bg-[#30363d] text-white font-medium hover:bg-[#40464d] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
