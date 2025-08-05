import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const Profile = () => {
  const { user, setUser } = useUser();
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
      // Prepend backend base URL if photo path exists and is relative
      const backendBaseUrl = "http://localhost:5000";
      let photoUrl = res.data.photo || "";
      if (photoUrl && !photoUrl.startsWith("http")) {
        photoUrl = backendBaseUrl + photoUrl;
      }
      setPhotoUrl(photoUrl);
      setLeetcodeUsername(res.data.platforms?.leetcode || "");
      } catch (err) {
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
      // Validate LeetCode username before submitting update
      if (leetcodeUsername) {
        const validateRes = await axiosInstance.get(`/users/validate/leetcode/${leetcodeUsername}`);
        if (!validateRes.data.valid) {
          setStatus("User not found or invalid user");
          setSaving(false);
          return;
        }
      }

      // Validate username uniqueness before submitting update
    if (name) {
      const res = await axiosInstance.get(`/users/search?query=${name}`);
      const nameExists = res.data.some(u => u.name === name && u._id !== (user._id || user.uid));
      if (nameExists) {
        setStatus("Username already taken");
        setSaving(false);
        return;
      }
    }

      // Prepare data for update
      const updateData = {
        name,
        email,
        phone,
        platforms: [],
      };
      if (leetcodeUsername) {
        // If leetcodeUsername is a string, treat it as username, not JSON string
        if (typeof leetcodeUsername === "string") {
          updateData.platforms.push({ platform: "leetcode", username: leetcodeUsername });
        } else {
          updateData.platforms.push({ platform: "leetcode", username: leetcodeUsername });
        }
      }

      // If photo file is selected, use FormData for multipart upload
    if (photoFile) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("platforms", JSON.stringify(updateData.platforms));
      formData.append("photo", photoFile);

      const userId = user._id || user.uid;
      await axiosInstance.put(`/users/update-profile/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Send JSON if no photo file
      const userId = user._id || user.uid;
      await axiosInstance.put(`/users/update-profile/${userId}`, updateData);
    }

      setStatus("Profile updated successfully!");
      // Fetch updated profile from backend to get correct photo URL and update user context
      const userId = user._id || user.uid;
      const updatedProfile = await axiosInstance.get(`/users/profile/${userId}`);
      // Prepend backend base URL if photo path exists and is relative
      let updatedPhotoUrl = updatedProfile.data.photo || photoUrl;
      if (updatedPhotoUrl && !updatedPhotoUrl.startsWith("http")) {
        updatedPhotoUrl = "http://localhost:5000" + updatedPhotoUrl;
      }
      setUser(prevUser => ({
        ...prevUser,
        displayName: updatedProfile.data.name || name,
        photoURL: updatedPhotoUrl,
        photo: updatedPhotoUrl,
      }));
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setStatus(err.response.data.error);
      } else {
        setStatus("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-10 px-4 md:px-6">
      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
        Profile
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
        <label className="flex flex-col text-white font-semibold">
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="Your name"
          />
        </label>
        <label className="flex flex-col text-white font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="Your email"
          />
        </label>
        <label className="flex flex-col text-white font-semibold">
          Phone
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="mt-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="Your phone number"
          />
        </label>
        <label className="flex flex-col text-white font-semibold">
          LeetCode Username
          <input
            type="text"
            value={leetcodeUsername}
            onChange={e => setLeetcodeUsername(e.target.value)}
            className="mt-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            placeholder="Your LeetCode username"
          />
        </label>
        <label className="flex flex-col text-white font-semibold">
          Profile Image
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-1"
          />
          {photoUrl && (
            <img src={photoUrl} alt="Profile Preview" className="mt-4 w-32 h-32 rounded-full object-cover" />
          )}
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-full bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black font-bold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {status && <p className="text-lime-400 font-semibold text-center mt-4">{status}</p>}
      </form>
    </div>
  );
};

export default Profile;
