import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import axios from "../api/axiosInstance";

const History = () => {
  const { user } = useUser();
  const [platform, setPlatform] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError("");
      try {
        const qs = platform ? `?platform=${platform}` : "";
        const res = await axios.get(`/history/${user._id}${qs}`);
        setItems(res.data.items || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, platform]);

  if (!user) return <div className="text-white p-6">Please log in first.</div>;
  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#18181b] text-white px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-6">Streak History</h1>

      <div className="mb-4">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="p-3 rounded bg-[#2a2a31] border border-white/10">
          <option value="">All Platforms</option>
          <option value="leetcode">LeetCode</option>
          <option value="codeforces">Codeforces</option>
          <option value="gfg">GeeksforGeeks</option>
          <option value="hackerrank">HackerRank</option>
        </select>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="bg-[#1f1f24] border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="p-3">Date</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Username</th>
              <th className="p-3">Maintained</th>
              <th className="p-3">Current</th>
              <th className="p-3">Longest</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t border-gray-700">
                <td className="p-3">{new Date(it.date).toLocaleDateString()}</td>
                <td className="p-3 capitalize">{it.platform}</td>
                <td className="p-3">{it.username}</td>
                <td className="p-3">{it.maintained ? "Yes" : "No"}</td>
                <td className="p-3">{it.currentStreak}</td>
                <td className="p-3">{it.longestStreak}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">No history yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History; 