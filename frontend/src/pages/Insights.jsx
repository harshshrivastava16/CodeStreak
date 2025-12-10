import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

const Panel = ({ children, theme = "dark", className }) => (
  <motion.div
    className={`p-6 rounded-2xl shadow-md backdrop-blur-md ${
      theme === "light" ? "bg-white/60" : "bg-zinc-900/70"
    } ${className || ""}`}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.32 }}
  >
    {children}
  </motion.div>
);

const GlowProgress = ({ value = 0 }) => (
  <div className="relative w-24 h-24">
    <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-lime-400" />
    <div className="relative flex items-center justify-center w-full h-full text-white font-bold text-xl">
      {value}%
    </div>
  </div>
);

const Insights = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [timeRange, setTimeRange] = useState("6M");

  const theme = user?.settings?.theme || "dark";

  /* -------------------------------------------------------------------------
     Generate month list
  ------------------------------------------------------------------------- */
  const generateMonthRange = (range) => {
    const base = new Date(2025, 8, 1);
    const count =
      range === "3M" ? 3 :
      range === "6M" ? 6 :
      range === "1Y" ? 12 : 14;

    const arr = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(base);
      d.setMonth(base.getMonth() + i);
      arr.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        month: d.getMonth() + 1,
        year: d.getFullYear()
      });
    }
    return arr;
  };

  /* -------------------------------------------------------------------------
     Fill consistency graph dataset
  ------------------------------------------------------------------------- */
  const fillConsistencyData = (raw, range) => {
    const timeline = generateMonthRange(range);
    const map = {};

    raw?.forEach((item) => {
      const [mon, year] = item.month.split(" ");
      const date = new Date(`${mon} 1, ${year}`);
      map[`${date.getMonth() + 1}-${date.getFullYear()}`] =
        item.consistency || 0;
    });

    return timeline.map((m) => ({
      ...m,
      consistency: map[`${m.month}-${m.year}`] || 0,
    }));
  };

  /* -------------------------------------------------------------------------
     Fetch Insights
  ------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchInsights = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/ml/${user._id}`);
        setInsights(res.data);
        setError(null);
      } catch {
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [user]);

  const refreshInsights = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      await axiosInstance.post(`/ml/${user._id}/refresh`);
      const res = await axiosInstance.get(`/ml/${user._id}`);
      setInsights(res.data);
      setError(null);
    } catch {
      setError("Failed to refresh insights");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------
     Handle opening a recommended problem
  ------------------------------------------------------------------------- */
  const handleOpenProblem = async (problem) => {
    if (!user?._id) return;

    try {
      await axiosInstance.post(`/ml/${user._id}/recommended/solve`, {
        title: problem.title,
        platform: problem.platform,
      });

      const updated = await axiosInstance.get(`/ml/${user._id}`);
      setInsights(updated.data);
    } catch (err) {
      console.error("Failed updating recommendation", err);
    } finally {
      if (problem.url) {
        window.open(problem.url, "_blank");
      } else {
        const slug = problem.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        window.open(`https://leetcode.com/problems/${slug}/`, "_blank");
      }
    }
  };

  /* -------------------------------------------------------------------------
     UI Rendering
  ------------------------------------------------------------------------- */
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111827] text-white">
        Please log in to view insights.
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Loading insights…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111827]">
        <div className="rounded-xl p-6 bg-red-500/10 text-red-400 border border-red-400/40">
          <h2 className="font-semibold text-lg">Error Fetching Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  const consistencyData = fillConsistencyData(
    insights?.performanceHistory?.data,
    timeRange
  );

  return (
    <div
      className={`min-h-screen ${
        theme === "light"
          ? "bg-white/50 text-black"
          : "bg-[#111827] text-white"
      }`}
    >
      <Sidebar variant="insights" />
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 md:ml-56 pt-[6.4rem] space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Insights
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {insights?.lastUpdated}
            </p>
          </div>

          <button
            onClick={refreshInsights}
            className="px-4 py-2 rounded-lg bg-zinc-900/70 text-white hover:opacity-95 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh now
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-6">

            {/* WEAK TOPICS */}
            <Panel theme={theme}>
              <h3 className="text-lg font-semibold">Weak Topics</h3>
              <p className="text-sm text-zinc-400 mb-4">Focus on these areas to improve.</p>
              <ul className="space-y-4">
                {insights?.weakTopics?.map((topic, index) => (
                  <li key={index}>
                    <div className="flex justify-between text-zinc-300">
                      <span>{topic.name}</span>
                      <span
                        className={`font-semibold ${
                          topic.color === "red"
                            ? "text-red-400"
                            : topic.color === "yellow"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {topic.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 rounded-full"
                        style={{ width: `${topic.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* PREDICTIONS */}
            <Panel theme={theme}>
              <h3 className="text-lg font-semibold">Predictions</h3>
              <p className="text-sm text-zinc-400 mb-4">Your forecasted performance.</p>

              <div className="flex flex-col items-center gap-6">
                <GlowProgress value={insights?.predictions?.potdSuccess} />
                <div className="flex justify-between w-full bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">warning</span>
                    Risk of Drop
                  </div>
                  <span className="font-semibold text-yellow-400">
                    {insights?.predictions?.riskOfDrop}%
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* CONSISTENCY GRAPH */}
          <Panel theme={theme} className="lg:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Consistency History</h3>
                <p className="text-sm text-zinc-400">Your month-by-month consistency %.</p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-lg">
                {["3M", "6M", "1Y", "All"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      timeRange === r
                        ? "bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 w-full overflow-x-auto">
              {(() => {
                const data = consistencyData;
                const total = data.length;
                const width = Math.max(600, total * 60);
                const padding = 60;
                const xStep = (width - padding * 2) / (total - 1);

                return (
                  <svg viewBox={`0 0 ${width} 300`} className="w-full h-80">

                    {/* GRID */}
                    <g stroke={theme === "light" ? "#d4d4d8" : "#374151"}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <line
                          key={i}
                          x1={padding}
                          x2={width - padding}
                          y1={250 - i * 40}
                          y2={250 - i * 40}
                          strokeDasharray={i === 0 ? "0" : "2 2"}
                        />
                      ))}
                    </g>

                    {/* MONTHS */}
                    <g fill={theme === "light" ? "#4b5563" : "#9ca3af"} textAnchor="middle">
                      {data.map((p, i) => (
                        <text key={i} x={padding + i * xStep} y={280}>
                          {p.label}
                        </text>
                      ))}
                    </g>

                    {/* Y LABELS */}
                    <g fill={theme === "light" ? "#4b5563" : "#9ca3af"} textAnchor="end">
                      {[0, 25, 50, 75, 100].map((v) => (
                        <text key={v} x={padding - 10} y={250 - v * 2}>
                          {v}
                        </text>
                      ))}
                    </g>

                    {/* AREA */}
                    <polygon
                      fill="rgba(132, 204, 22, 0.2)"
                      points={`
                        ${padding},250
                        ${data.map((p, i) => `${padding + i * xStep},${250 - p.consistency * 2}`).join(" ")}
                        ${padding + (total - 1) * xStep},250
                      `}
                    />

                    {/* LINE */}
                    <polyline
                      fill="none"
                      stroke="#84cc16"
                      strokeWidth="3"
                      points={data
                        .map((p, i) => `${padding + i * xStep},${250 - p.consistency * 2}`)
                        .join(" ")}
                    />

                    {/* POINTS */}
                    {data.map((p, i) => (
                      <circle
                        key={i}
                        cx={padding + i * xStep}
                        cy={250 - p.consistency * 2}
                        r="5"
                        fill="#84cc16"
                      />
                    ))}
                  </svg>
                );
              })()}
            </div>
          </Panel>
        </div>

        {/* TIME INSIGHTS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <Panel theme={theme}>
            <h3 className="text-lg font-semibold">Time vs Accuracy</h3>
            <p className="mt-2 text-zinc-300">
              Your accuracy peaks in{" "}
              <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                {insights?.timeInsights?.peakHours}
              </span>
              .
            </p>
          </Panel>

          <Panel theme={theme}>
            <h3 className="text-lg font-semibold">Best Reminder Window</h3>
            <p className="mt-2 text-zinc-300">
              Recommended between{" "}
              <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                {insights?.timeInsights?.reminderWindow}
              </span>
              .
            </p>
          </Panel>

          {/* RECOMMENDED PROBLEMS */}
          <Panel theme={theme} className="md:col-span-2">
            <h3 className="text-lg font-semibold">Recommended Problems</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Tailored problems to sharpen your skills.
            </p>

            <div className="divide-y divide-zinc-800">
              {insights?.recommendedProblems?.map((problem, i) => (
                <div key={i} className="flex justify-between py-3">
                  <div>
                    <p className="text-zinc-200">{problem.title}</p>
                    <p className="text-xs text-zinc-400">{problem.platform}</p>
                  </div>

                  <button
                    onClick={() => handleOpenProblem(problem)}
                    className="text-lime-400 hover:text-lime-300"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
};

export default Insights;
