import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";

const Profile = () => {
  const { user } = useUser();
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    if (user?._id) {
      const fetchStats = async () => {
        try {
          const statsRes = await axiosInstance.get(`/users/direct-streaks/${user._id}`);
          const stats = statsRes.data;
          const isPro = user?.subscription?.tier === 'pro';
          let sum = 0;
          stats.forEach(stat => {
            if (isPro || stat.platform === 'leetcode') {
              sum += stat.totalSolved || 0;
            }
          });
          setTotalProblems(sum);
        } catch (err) {
          console.error("Error fetching stats:", err);
          setTotalProblems(0);
        }
      };
      fetchStats();
    }
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111827]">
        <p className="text-zinc-400 animate-pulse">Loading profile...</p>
      </div>
    );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white overflow-hidden">
      {/* === Background (same as Friends.jsx) === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-purple-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/10 via-purple-400/10 to-lime-400/10 rounded-full blur-[120px]"></div>
      </div>

      {/* === Sidebar === */}
      <Sidebar variant="profile" />

      {/* === Main Content === */}
      <main className="relative z-10 flex-1 p-8 md:p-10 overflow-y-auto pt-24 md:pt-24 md:pl-52">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Page Header */}
          <div>
            <h1 className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent text-4xl font-bold tracking-tight mb-2">
              Your Profile
            </h1>
            <p className="text-zinc-400 text-sm">View your coding journey.</p>
          </div>

          {/* Top Profile Panel */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-8 flex flex-col md:flex-row md:items-center gap-8 border border-zinc-800">
            {/* Profile Photo */}
            <img
              src={
                user.photo && !user.photo.startsWith("http")
                  ? "http://localhost:5000" + user.photo
                  : user.photo || "https://via.placeholder.com/150"
              }
              alt={user.name}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-cyan-400/40"
            />

            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-semibold">{user.name}</h2>
              <p className="text-zinc-400">{user.email}</p>
              <p className="text-xs text-zinc-500">
                Joined in {formatDate(user.createdAt || Date.now())}
              </p>

              <div className="flex gap-4 mt-4">
                <Link
                  to="/edit-profile"
                  className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 text-zinc-900 font-semibold hover:opacity-90 transition"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/setup/step1"
                  className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-purple-400 to-lime-600 text-zinc-900 font-semibold hover:opacity-90 transition"
                >
                  Setup
                </Link>
              </div>
            </div>
          </div>

          {/* Coding Stats */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6">Coding Stats</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  label: "Total Problems Solved",
                  value: totalProblems,
                },
                {
                  label: "Current Streak",
                  value: user.currentStreaks?.leetcode || 0,
                },
                {
                  label: "Longest Streak",
                  value: user.longestStreaks?.leetcode || 0,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-zinc-800/60 p-6 border border-zinc-700/40"
                >
                  <p className="text-zinc-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Platforms */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6">Connected Platforms</h2>

            {(!user.platforms || user.platforms.length === 0) && (
              <p className="text-zinc-500">No platforms linked yet.</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {user.platforms?.map((plat, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-zinc-800/60 p-5 border border-zinc-700/40 flex items-center gap-4"
                >
                  <span className="material-symbols-outlined text-cyan-400 text-3xl">
                    link
                  </span>
                  <p className="font-semibold">{plat.platform}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>

            {(!user.recentActivity || user.recentActivity.length === 0) && (
              <p className="text-zinc-500">No recent activity.</p>
            )}

            <div className="space-y-6">
              {user.recentActivity?.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/30 mt-2"></div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-zinc-500 text-sm">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
