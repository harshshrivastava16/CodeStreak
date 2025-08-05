import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const platformLabels = {
  leetcode: "LeetCode",
};

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [streaks, setStreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  // Initialize usernameValid from localStorage to persist verification status
  const [usernameValid, setUsernameValid] = useState(() => {
    const saved = localStorage.getItem("leetcodeUsernameValid");
    return saved === "true";
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("");

  const fetchStreaks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use user.id for email/password login and user.uid for Google login
      const userId = user.uid || user._id;
      const res = await axiosInstance.get("/users/profile/" + userId);
      setStreaks(res.data);
      // Extract leetcode username from platforms array
      const leetcodePlatform = res.data.platforms?.find(p => p.platform === "leetcode");
      const username = leetcodePlatform ? leetcodePlatform.username : "";
      setLeetcodeUsername(username);
      setUsernameValid(!!username);
    } catch (err) {
      setError("Failed to load streaks");
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = async (username) => {
    if (!username) return false;
    try {
      const res = await axiosInstance.get("/users/validate/leetcode/" + username);
      return res.data.valid;
    } catch {
      return false;
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyStatus("");
    const isValid = await validateUsername(leetcodeUsername);
    if (isValid) {
      try {
        // Update user's platforms on backend
        await axiosInstance.put(`/users/update-profile/${user.uid}`, {
          platforms: [{ platform: "leetcode", username: leetcodeUsername }]
        });
        setUsernameValid(true);
        localStorage.setItem("leetcodeUsernameValid", "true");
        setVerifyStatus("LeetCode username verified!");
        await fetchStreaks(); // refresh streaks after update
        // Removed navigate to avoid state reset
      } catch {
        setVerifyStatus("Failed to update username");
      }
    } else {
      setVerifyStatus("Invalid LeetCode username");
    }
    setVerifying(false);
  };

  useEffect(() => {
    if (user) fetchStreaks();
    // eslint-disable-next-line
  }, [user]);

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;
  if (error) return <div className="text-red-400 p-10 text-center">{error}</div>;

  const selectedPlatforms = streaks?.selectedPlatforms || [];
  const filteredPlatforms = selectedPlatforms.filter(p => p === "leetcode");

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-10 px-4 md:px-6">
      {!usernameValid ? (
        <div className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-white">Verify Your LeetCode Username</h2>
          <input
            type="text"
            value={leetcodeUsername}
            onChange={(e) => setLeetcodeUsername(e.target.value)}
            placeholder="Enter your LeetCode username"
            className="mb-4 px-5 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 w-full text-lg"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-3 rounded-full bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black font-bold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying..." : "Verify Username"}
          </button>
          {verifyStatus && (
          <p className={"mt-4 text-center font-semibold " + (verifyStatus.includes("Invalid") ? "text-red-500" : "text-lime-400")}>
            {verifyStatus}
          </p>
          )}
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            Your Streaks
          </h2>
          <div className="mb-8 w-full max-w-3xl">
            <div className="bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 h-1 rounded-full" />
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-xl p-6 text-center mt-6">
              <h3 className="text-2xl font-bold text-white mb-2">How it works</h3>
              <p className="text-gray-300">
                Solve the daily challenges on your selected platforms and keep your streaks alive! Your streaks update every night at 11 PM. Compete with friends and climb the leaderboard.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {filteredPlatforms.length === 0 ? (
              <p className="text-gray-400 text-center w-full">No platforms selected. Please add platforms in settings.</p>
            ) : (
              filteredPlatforms.map((platform) => {
                const current = streaks?.currentStreaks?.[platform] || 0;
                const longest = streaks?.longestStreaks?.[platform] || 0;
                // Correctly find username from platforms array
                const platformObj = streaks?.platforms?.find(p => p.platform === platform);
                const username = platformObj ? platformObj.username : "Not set";
                const lastUpdated = streaks?.lastUpdated?.[platform]
                  ? new Date(streaks.lastUpdated[platform]).toLocaleDateString()
                  : "-";

                return (
                  <div key={platform} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all">
                    <div className="text-6xl font-extrabold text-lime-400 mb-3">{current}</div>
                    <div className="text-xl text-gray-300 mb-3">Current {platformLabels[platform]} Streak</div>
                    <div className="text-sm text-gray-500 mb-4">
                      Username: <span className="text-blue-400">{username}</span>
                    </div>
                    <div className="text-6xl font-extrabold text-purple-400 mb-3">{longest}</div>
                    <div className="text-xl text-gray-300 mb-3">Longest {platformLabels[platform]} Streak</div>
                    <div className="text-sm text-gray-500">
                      Last Updated: <span className="text-lime-400">{lastUpdated}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
