import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import axiosInstance from "../api/axiosInstance";
import { motion } from "framer-motion";

/* ---------- Platform Logos ---------- */
const platformLogos = {
  leetcode: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
  codeforces: "https://sta.codeforces.com/s/11952/images/codeforces-logo-with-letters.png",
  gfg: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200X200.png",
  hackerrank: "https://upload.wikimedia.org/wikipedia/commons/6/65/HackerRank_logo.png",
};

/* ---------- Helpers ---------- */
const resolveUserId = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  if (user._id && typeof user._id === "string") return user._id;
  if (user._id && typeof user._id === "object" && user._id.$oid) return user._id.$oid;
  if (user.id) return user.id;
  if (user.userId) return user.userId;
  if (user.uid) return user.uid;
  return null;
};

const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
};

const extractMaxStreakFromProfile = (profile) => {
  if (!profile) return 0;

  if (typeof profile.currentStreak === "number") return profile.currentStreak;
  if (typeof profile.streak === "number") return profile.streak;

  const cs = profile.currentStreaks ?? profile.currentStreaksRaw ?? null;

  if (cs != null) {
    if (typeof cs === "number") return cs;
    if (typeof cs === "string" && /^\d+$/.test(cs)) return Number(cs);

    if (typeof cs === "object") {
      const values = Object.values(cs).map((v) => {
        if (typeof v === "number") return v;
        const n = toNumber(v);
        if (n !== null) return n;

        if (typeof v === "object") {
          if (typeof v.streak === "number") return v.streak;
          if (typeof v.currentStreak === "number") return v.currentStreak;
          if (typeof v.value === "number") return v.value;
        }
        return 0;
      });
      return Math.max(...values, 0);
    }
  }

  if (typeof profile.maxCurrentStreak === "number") return profile.maxCurrentStreak;

  return 0;
};

const extractUserArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.friends)) return raw.friends;
  if (Array.isArray(raw.users)) return raw.users;
  if (Array.isArray(raw.data)) return raw.data;
  const nested = Object.values(raw).find((v) => Array.isArray(v));
  return nested || [];
};

/* ---------- Home ---------- */
const Home = () => {
  const { user } = useUser();
  const [streak, setStreak] = useState(0);
  const [rank, setRank] = useState(null);
  const [platformSummary, setPlatformSummary] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const userId = resolveUserId(user);

    try {
      const profileRes = await axiosInstance.get(`/users/profile/${userId}`);
      const profile = profileRes.data;

      setStreak(extractMaxStreakFromProfile(profile));

      const platforms = [];
      const seenPlatforms = new Set();
      if (Array.isArray(profile.platforms)) {
        for (const p of profile.platforms) {
          const platformName = (p.platform || "").trim().toLowerCase();
          if (platformName && !seenPlatforms.has(platformName)) {
            seenPlatforms.add(platformName);
            platforms.push({
              platform: platformName,
              problemsSolved: typeof p.totalSolved === "number" ? p.totalSolved : 0,
              lastActive: profile.lastUpdated?.[p.platform] || null,
            });
          }
        }
      }
      setPlatformSummary(platforms);

      const globalRes = await axiosInstance.get(`/users/global`);
      const globalArr = extractUserArray(globalRes.data);

      const fullUsers = await Promise.all(
        globalArr.map(async (u) => {
          try {
            const id = resolveUserId(u);
            const res = await axiosInstance.get(`/users/profile/${id}`);
            const p = res.data;

            return {
              ...u,
              currentStreak: extractMaxStreakFromProfile(p),
            };
          } catch {
            return { ...u, currentStreak: u.currentStreak ?? 0 };
          }
        })
      );

      const sorted = fullUsers.sort(
        (a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0)
      );

      const idx = sorted.findIndex((u) => resolveUserId(u) === userId);
      setRank(idx !== -1 ? idx + 1 : null);

      try {
        const actRes = await axiosInstance.get(`/history/${userId}/solves?limit=5`);
        const items = actRes.data.items || [];
        setRecentActivity(
          items.map((i) => ({
            description: i.title,
            timeAgo: i.timeAgo,
            type: "solve",
          }))
        );
      } catch {
        setRecentActivity([]);
      }
    } catch (err) {
      console.error("Home load error:", err);
      setRank(null);
      setStreak(0);
      setPlatformSummary([]);
      setRecentActivity([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "N/A";
    const now = new Date();
    if (d > now) return "N/A"; // Prevent future dates
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white pt-20">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8 pt-[4.4rem] md:pt-[4.4rem] md:pl-56">

          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.name || "Coder"}
            </h1>
            <p className="text-zinc-400 mt-2">
              Let’s keep that streak alive — every day counts. 💪
            </p>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "local_fire_department",
                label: "Current Streak",
                value: `${streak} days`,
                color: "from-orange-400 to-rose-500",
              },
              {
                icon: "leaderboard",
                label: "Rank",
                value: rank ? `#${rank}` : "N/A",
                color: "from-blue-400 to-indigo-500",
              },
              {
                icon: "flag",
                label: "Daily Goal",
                value: user?.dailyGoalNumber
                  ? `${user.dailyGoalNumber} ${user.dailyGoalType}`
                  : "Not set",
                color: "from-lime-400 to-green-500",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg flex items-center gap-5"
              >
                <div className={`p-4 rounded-full bg-gradient-to-br ${s.color}`}>
                  <span className="material-symbols-outlined text-white text-3xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? "..." : s.value}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Platform Summary & Recent Activity */}
          <div className="grid grid-cols-12 gap-10">

            {/* Platform Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 xl:col-span-8 bg-zinc-900/70 rounded-2xl p-6 backdrop-blur-md shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-6">Platform Summary</h2>

              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4 text-zinc-400">Platform</th>
                    <th className="px-6 py-4 text-zinc-400">Solved</th>
                    <th className="px-6 py-4 text-zinc-400">Last Active</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-700">
                  {platformSummary.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-zinc-400">
                        No platform data
                      </td>
                    </tr>
                  ) : (
                    platformSummary.map((p, i) => (
                      <tr key={i} className="hover:bg-zinc-800 transition">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={platformLogos[p.platform] || "/logos/default.png"}
                            alt={p.platform}
                            className="h-8 w-8 rounded-full"
                          />
                          {p.platform}
                        </td>

                        <td className="px-6 py-4">{p.problemsSolved}</td>
                        <td className="px-6 py-4">{formatDate(p.lastActive)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 xl:col-span-4 bg-zinc-900/70 rounded-2xl p-6 backdrop-blur-md shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <p className="text-zinc-400">No recent activity</p>
              ) : (
                recentActivity.map((a, i) => (
                  <div key={i} className="flex gap-4 mb-6">

                    {/* ---------- FIXED ICON CONTAINER ---------- */}
                    <div className="bg-gradient-to-br from-cyan-400 to-purple-500 h-10 w-10 flex items-center justify-center rounded-full">
                      <span className="material-symbols-outlined text-white text-xl">
                        {a.type === "solve" ? "code" : "flag"}
                      </span>
                    </div>
                    {/* ---------- END FIX ---------- */}

                    <div>
                      <p className="font-medium">{a.description}</p>
                      <p className="text-xs text-zinc-400 mt-1">{a.timeAgo}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
