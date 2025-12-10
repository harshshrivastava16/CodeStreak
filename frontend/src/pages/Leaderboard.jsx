import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";
import { useUser } from "../context/UserContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


// ------------------ Helpers (robust parsing) ------------------
const resolveUserId = (friend) => {
  if (!friend) return null;
  if (friend._id && typeof friend._id === "string") return friend._id;
  if (friend._id && typeof friend._id === "object" && friend._id.$oid) return friend._id.$oid;
  if (friend.id && typeof friend.id === "string") return friend.id;
  if (friend.userId && typeof friend.userId === "string") return friend.userId;
  return null;
};

const toNumber = (v) => {
  if (typeof v === "number" && !isNaN(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
};

const extractMaxStreakFromProfile = (profile) => {
  if (!profile) return 0;
  if (typeof profile.currentStreak === "number") return profile.currentStreak;
  if (typeof profile.streak === "number") return profile.streak;
  const cs = profile.currentStreaks ?? profile.currentStreaksRaw ?? null;
  if (cs != null) {
    const asNum = toNumber(cs);
    if (asNum !== null) return asNum;
    if (typeof cs === "object") {
      const candidateValues = Object.values(cs).map((v) => {
        if (typeof v === "number") return v;
        const n = toNumber(v);
        if (n !== null) return n;
        if (v && typeof v === "object") {
          if (typeof v.streak === "number") return v.streak;
          if (typeof v.currentStreak === "number") return v.currentStreak;
          if (typeof v.value === "number") return v.value;
        }
        return 0;
      });
      if (candidateValues.length) return Math.max(...candidateValues);
    }
  }
  if (typeof profile.maxCurrentStreak === "number") return profile.maxCurrentStreak;
  if (typeof profile.maxCurrentStreak === "string" && /^\d+$/.test(profile.maxCurrentStreak))
    return Number(profile.maxCurrentStreak);
  return 0;
};

// ------------------ Custom hooks ------------------
// useDebouncedValue: small utility to debounce rapid input changes
const useDebouncedValue = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

// useLeaderboard: encapsulates fetching logic and local enrichment
const useLeaderboard = (currentUserId, scope) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!currentUserId) return;
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const url = scope === "Friends" ? `/users/friends/${currentUserId}` : `/users/global`;
      const res = await axiosInstance.get(url, { signal: controllerRef.current.signal });
      const baseFriends = res.data.friends ?? [];

      // For each friend try to fetch a profile to extract a reliable streak value.
      const enriched = await Promise.all(
        baseFriends.map(async (f) => {
          try {
            const id = resolveUserId(f);
            if (!id) return { ...f, currentStreak: f.currentStreak ?? 0 };
            // profile call guarded
            const profileRes = await axiosInstance.get(`/users/profile/${id}`, { signal: controllerRef.current.signal });
            const profile = profileRes.data ?? {};
            const max = extractMaxStreakFromProfile(profile);
            return {
              ...f,
              currentStreak: max ?? f.currentStreak ?? 0,
              longestStreak: profile.longestStreak ?? f.longestStreak ?? 0,
            };
          } catch (e) {
            // on error just fallback gracefully
            return { ...f, currentStreak: f.currentStreak ?? 0 };
          }
        })
      );

      // mark current user if present
      const normalized = enriched.map((f) => ({
        ...f,
        isCurrentUser: resolveUserId(f) === currentUserId || f._id === currentUserId || f.id === currentUserId,
      }));

      setItems(normalized);
      setLoading(false);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("Leaderboard fetch failed", err);
      setError("Unable to load leaderboard");
      setLoading(false);
    }
  }, [currentUserId, scope]);

  useEffect(() => {
    fetch();
    // cleanup on unmount
    return () => controllerRef.current?.abort();
  }, [fetch]);

  return { items, loading, error, refresh: fetch };
};

// useHistory: small hook for fetch user's solves history
const useHistory = (userId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const res = await axiosInstance.get(`/history/${userId}/solves`, { signal: controllerRef.current.signal });
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => controllerRef.current?.abort();
  }, [userId]);

  return { history, loading };
};

// ------------------ Presentational components ------------------
const SkeletonRow = () => (
  <div className="animate-pulse flex items-center justify-between p-4 rounded-2xl bg-zinc-800/60">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-zinc-700" />
      <div className="h-4 w-40 bg-zinc-700 rounded" />
    </div>
    <div className="flex gap-4">
      <div className="h-4 w-12 bg-zinc-700 rounded" />
      <div className="h-4 w-12 bg-zinc-700 rounded" />
    </div>
  </div>
);

const Podium = ({ top }) => (
  <div className="grid grid-cols-3 gap-6 items-end">
    {top.map((u, i) => (
      <motion.div
        key={u._id || u.id || `pod-${i}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06 }}
        className={`rounded-2xl p-4 flex flex-col items-center justify-end bg-gradient-to-b from-zinc-900/60 to-zinc-900/40 border border-zinc-800 shadow-md`}
      >
        <div className="text-sm text-zinc-400 mb-2">#{i + 1}</div>
        <img
          src={u.photo && !u.photo.startsWith("http") ? "http://localhost:5000" + u.photo : u.photo || "https://via.placeholder.com/96"}
          alt={u.name}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-cyan-400"
        />
        <div className="mt-3 text-center">
          <div className="font-semibold">{u.name}</div>
          <div className="text-lime-400 font-bold text-lg">{u.currentStreak ?? 0}</div>
        </div>
      </motion.div>
    ))}
  </div>
);

const Row = ({ rank, friend }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800"
  >
    <div className="flex items-center gap-3">
      <div className="w-6 text-center font-semibold">{rank}</div>
      <img
        src={friend.photo && !friend.photo.startsWith("http") ? "http://localhost:5000" + friend.photo : friend.photo || "https://via.placeholder.com/48"}
        alt={friend.name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-400"
      />
      <div className="min-w-0">
        <div className="font-medium truncate">{friend.name}</div>
        <div className="text-xs text-zinc-400">{friend.isCurrentUser ? "You" : ""}</div>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-1 text-orange-400">
        <span className="material-symbols-outlined">local_fire_department</span>
        <span className="font-semibold">{friend.longestStreak ?? 0}</span>
      </div>
      <div className="flex items-center gap-1 text-lime-400">
        <span className="material-symbols-outlined">local_fire_department</span>
        <span className="font-semibold">{friend.currentStreak ?? 0}</span>
      </div>
    </div>
  </motion.div>
);

// ------------------ Main component ------------------
export default function LeaderboardRedesign() {
  const { user } = useUser();
  const navigate = useNavigate();

  // local UI state
  const [scope, setScope] = useState("Friends");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [chartRange, setChartRange] = useState("7D");

  const { items, loading, error, refresh } = useLeaderboard(user?._id, scope);
  const { history } = useHistory(user?._id);

  // filter & sort clients
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list = items.filter((f) => (f.name || "").toLowerCase().includes(q));
    return list.sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0));
  }, [items, debouncedQuery]);

  const topThree = filtered.slice(0, 3);
  const currentIdx = filtered.findIndex((f) => f.isCurrentUser);
  const currentRank = currentIdx >= 0 ? currentIdx + 1 : null;
  const currentUser = filtered.find((f) => f.isCurrentUser) ?? null;

  // chart for my rank
  // Safe date parser for robust chart filtering
  const safeDate = (d) => {
    const t = new Date(d);
    return isNaN(t.getTime()) ? null : t;
  };

  const chartData = useMemo(() => {
    const data = Array.isArray(history) ? history : [];
    const now = new Date();
    const days = chartRange === "3D" ? 3 : chartRange === "7D" ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 3600 * 1000);
    let slice = data.filter((d) => (safeDate(d.date)) >= cutoff);
    if (slice.length === 0) slice = [{ date: new Date().toISOString().split("T")[0], problemsSolved: 0 }];
    return {
      labels: slice.map((s) => new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
      datasets: [
        {
          label: "Problems Solved",
          data: slice.map((s) => s.problemsSolved ?? 0),
          borderColor: "#a3e635",
          backgroundColor: "rgba(163,230,53,0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [history, chartRange]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: "#0b1220", titleColor: "#fff", bodyColor: "#fff" },
      },
      scales: { x: { ticks: { color: "#9ca3af" } }, y: { beginAtZero: true, ticks: { color: "#9ca3af", stepSize: 1 } } },
    }),
    []
  );

  // small keyboard accessibility: Enter key in search focuses first result
  const firstResultRef = useRef(null);
  useEffect(() => {
    const el = firstResultRef.current;
    if (!el) return;
    // no-op placeholder: if you want to focus programmatically add more logic here
  }, [filtered]);

  // UI render
  return (
    <div className="relative flex min-h-screen bg-gradient-to-b from-[#0b0f13] to-[#0b0f13] text-white overflow-hidden">
      <Sidebar variant="leaderboard" />

      <main className="relative z-10 flex-1 p-8 md:p-10 overflow-y-auto pt-24 md:pt-24 md:pl-52">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-500">Leaderboard</h1>
              <p className="text-zinc-400 mt-1">Track streaks, compare with friends, and climb the ranks.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2">
                <input
                  aria-label="Search users"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-transparent outline-none text-white placeholder-zinc-500 w-56"
                />
                <button onClick={() => setQuery("")} className="text-zinc-400 hover:text-white transition">Clear</button>
              </div>

              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-2 flex items-center gap-2">
                {['Friends', 'Global'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${scope === s ? 'bg-lime-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/compare')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 text-zinc-900 font-semibold hover:opacity-95 transition"
              >
                Compare
              </button>
            </div>
          </header>

          {/* Podium & summary */}
          <section>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/40 p-6 text-center text-red-200">{error}</div>
            ) : (
              <Podium top={topThree.length ? topThree : [{ name: '—', currentStreak: 0 }, { name: '—', currentStreak: 0 }, { name: '—', currentStreak: 0 }]} />
            )}
          </section>

          {/* Main grid: list + my card */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">All users</h2>
                <div className="text-sm text-zinc-400">{filtered.length} results</div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <div className="rounded-2xl bg-zinc-900/60 p-6 border border-zinc-800 text-zinc-400">No users found.</div>
                ) : (
                  <AnimatePresence>
                    {filtered.map((f, i) => (
                      <Row key={f._id || f.id || i} rank={i + 1} friend={f} ref={i === 0 ? firstResultRef : undefined} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>


              
            
          </section>
        </div>
      </main>
    </div>
  );
}
