import { useUser } from "../context/UserContext";
import { useDataCache } from "../context/DataCacheContext";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";

const platformLabels = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  gfg: "GeeksforGeeks",
  hackerrank: "HackerRank",
};

const platformColors = {
  leetcode: { primary: "lime-400", secondary: "lime-500" },
  codeforces: { primary: "blue-500", secondary: "blue-600" },
  gfg: { primary: "green-400", secondary: "green-500" },
  hackerrank: { primary: "teal-500", secondary: "teal-600" },
};

const getDynamicMax = (value, baseMax) => {
  let max = baseMax;
  while (value >= max) max *= 2;
  return max;
};

const colorClass = (color) => `text-${color}`;

const CircularStat = ({ label, value, color, baseMax }) => {
  const max = label === "Accuracy" ? 100 : getDynamicMax(value, baseMax);
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-2 min-w-[6rem]">
      <div className={`relative w-24 h-24`}>
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle
            className={`stroke-current opacity-20 ${colorClass(color)}`}
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className={`stroke-current ${colorClass(color)}`}
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset={100 - percent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass(color)}`}>
            {value}
            {label === "Accuracy" ? "%" : ""}
          </span>
        </div>
      </div>
      <span className="text-xs text-zinc-400 text-center">
        {label}
        {label !== "Accuracy" && ` (${value}/${max})`}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  const { updateCache } = useDataCache();
  const navigate = useNavigate();
  const [streaks, setStreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformInputs, setPlatformInputs] = useState({});
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyingPlatform, setVerifyingPlatform] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [visiblePlatforms, setVisiblePlatforms] = useState([]);

  const selectedPlatforms = useMemo(() => streaks?.selectedPlatforms || [], [streaks]);

  const fetchProfile = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) updateCache("streaks", null);
      const res = await axiosInstance.get("/users/profile/" + user._id);
      setStreaks(res.data);
      updateCache("streaks", res.data);

      const inputs = {};
      (res.data.platforms || []).forEach((p) => {
        inputs[p.platform] = p.username;
      });
      setPlatformInputs(inputs);

      const platformsWithUsernames =
        res.data.platforms?.filter((p) => p.username).map((p) => p.platform) ||
        [];
      if (res.data.selectedPlatforms && platformsWithUsernames.length > 0) {
        const updatedSelected = [
          ...new Set([...res.data.selectedPlatforms, ...platformsWithUsernames]),
        ];
        if (updatedSelected.length !== res.data.selectedPlatforms.length) {
          await axiosInstance.put(`/users/update-profile/${user._id}`, {
            selectedPlatforms: updatedSelected,
          });
        }
      }

      try {
        const statsRes = await axiosInstance.get(
          `/users/direct-streaks/${user._id}`
        );
        setPlatformStats(statsRes.data);
      } catch {
        setPlatformStats([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load streaks");
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = async (platform, username) => {
    if (!username) return false;
    try {
      const res = await axiosInstance.get(
        `/users/validate/${platform}/${username}`
      );
      return res.data.valid;
    } catch {
      return false;
    }
  };

  const handleVerify = async (platform) => {
    const username = platformInputs[platform];
    setVerifyingPlatform(platform);
    setVerifyMsg("");

    const isValid = await validateUsername(platform, username);
    if (isValid) {
      try {
        const newPlatforms = Array.isArray(streaks.platforms)
          ? [...streaks.platforms]
          : [];
        const idx = newPlatforms.findIndex((p) => p.platform === platform);
        if (idx >= 0) newPlatforms[idx].username = username;
        else newPlatforms.push({ platform, username });

        await axiosInstance.put(`/users/update-profile/${user._id}`, {
          platforms: newPlatforms,
        });
        setVerifyMsg(`${platformLabels[platform]} username verified!`);
        await fetchProfile(true);
      } catch {
        setVerifyMsg("Failed to update username");
      }
    } else {
      setVerifyMsg(`Invalid ${platformLabels[platform]} username`);
    }

    setVerifyingPlatform(null);
  };

  const handleRemovePlatform = (platform) => {
    setVisiblePlatforms((prev) => prev.filter((p) => p !== platform));
  };

  useEffect(() => {
    if (user) fetchProfile(true);
  }, [user]);

  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      setVisiblePlatforms((prev) => {
        const newOnes = selectedPlatforms.filter(p => !prev.includes(p));
        return [...prev, ...newOnes];
      });
    }
  }, [selectedPlatforms]);

 if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white">
      <div className="relative flex flex-col items-center justify-center">

        {/* Glowing Orb */}
        <div className="relative w-40 h-40 rounded-full bg-[#0f0f0f]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(140,100,255,0.35)] flex items-center justify-center">

          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-[spin_3s_linear_infinite] 
          border-t-lime-400 border-r-blue-400 border-b-purple-500"></div>

          {/* Inner Glow */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-lime-400/20 via-blue-400/20 to-purple-400/20 blur-2xl"></div>

          {/* Counter */}
          <span className="text-4xl font-bold bg-gradient-to-br from-lime-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
            ⚡
          </span>
        </div>

        {/* Text Below */}
        <p className="mt-6 text-zinc-400 tracking-wide animate-pulse">
          Initializing your streak…
        </p>
      </div>
    </div>
  );


  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-red-500">
        {error}
      </div>
    );

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:pl-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <button
              onClick={() => navigate('/setup-step1')}
              className="p-3 rounded-full bg-gradient-to-r from-lime-400 to-blue-500 text-black hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
              title="Add Platform"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            {visiblePlatforms.length === 0 ? (
              <p className="text-zinc-400 text-center w-full">
                No platforms visible. Click the add button to add platforms.
              </p>
            ) : (
              visiblePlatforms.map((platform) => {
                const current = streaks?.currentStreaks?.[platform] ?? 0;
                const longest = streaks?.longestStreaks?.[platform] ?? 0;
                const platformObj = streaks?.platforms?.find(
                  (p) => p.platform === platform
                );
                const statsObj =
                  platformStats.find((s) => s.platform === platform) || {};
                const username = platformObj?.username ?? "";
                const lastUpdated = streaks?.lastUpdated?.[platform]
                  ? new Date(streaks.lastUpdated[platform]).toLocaleString()
                  : null;
                const colors = platformColors[platform] || platformColors.leetcode;
                const hasError = !username || !lastUpdated;
                const statsLoading =
                  selectedPlatforms.length > 0 &&
                  statsObj.totalSolved === undefined &&
                  username;

                return (
                  <div
                    key={platform}
                    className="bg-zinc-900/70 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-white">
                        {platformLabels[platform] || platform}
                      </h2>
                      <div className="flex items-center gap-2">
                        {hasError ? (
                          <div className="flex items-center gap-2 text-orange-500">
                            <span className="material-symbols-outlined text-base">
                              error_outline
                            </span>
                            <span className="text-xs">Setup Required</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Last updated: {lastUpdated}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemovePlatform(platform)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remove Platform"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        aria-label={`${platformLabels[platform]} Username`}
                        className="bg-zinc-800/70 border border-zinc-700 text-white text-sm rounded-lg block w-full p-2.5 focus:ring-lime-500 focus:border-lime-500"
                        placeholder={`Enter ${platformLabels[platform] || platform} Username`}
                        type="text"
                        value={platformInputs[platform] ?? username}
                        onChange={(e) =>
                          setPlatformInputs((prev) => ({
                            ...prev,
                            [platform]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleVerify(platform)}
                        disabled={verifyingPlatform === platform}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-${colors.primary} to-${colors.secondary} hover:from-${colors.secondary} hover:to-${colors.primary} transition-all disabled:opacity-60`}
                      >
                        {verifyingPlatform === platform ? "Verifying..." : "Save"}
                      </button>
                    </div>

                    <div className="flex justify-between items-center gap-6 overflow-x-auto no-scrollbar flex-nowrap py-2">
                      {statsLoading ? (
                        <div className="flex-1 flex items-center justify-center py-8">
                          <div className="text-zinc-400 animate-pulse">
                            Loading stats...
                          </div>
                        </div>
                      ) : (
                        <>
                          <CircularStat
                            label="Current Streak"
                            value={current}
                            color={colors.primary}
                            baseMax={30}
                          />
                          <CircularStat
                            label="Longest Streak"
                            value={longest}
                            color="violet-500"
                            baseMax={50}
                          />
                          <CircularStat
                            label="Total Solved"
                            value={statsObj.totalSolved || statsObj.totalProblemsSolved || 0}
                            color="emerald-500"
                            baseMax={100}
                          />
                          <CircularStat
                            label="Easy"
                            value={statsObj.easy || 0}
                            color="cyan-400"
                            baseMax={100}
                          />
                          <CircularStat
                            label="Medium"
                            value={statsObj.medium || 0}
                            color="amber-500"
                            baseMax={75}
                          />
                          <CircularStat
                            label="Hard"
                            value={statsObj.hard || 0}
                            color="rose-500"
                            baseMax={50}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {verifyMsg && (
            <div className="mt-6 text-center text-sm text-zinc-300">
              {verifyMsg}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
