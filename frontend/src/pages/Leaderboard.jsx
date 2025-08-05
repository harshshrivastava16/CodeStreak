import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const Leaderboard = () => {
  const { user } = useUser();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist friends list in localStorage to survive refresh
  useEffect(() => {
    const savedFriends = localStorage.getItem("leaderboardFriends");
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
      setLoading(false);
    } else if (user) {
      fetchFriends();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = user.uid || user._id;
      const res = await axiosInstance.get(`/users/friends/${userId}`);
      setFriends(res.data.friends || []);
      localStorage.setItem("leaderboardFriends", JSON.stringify(res.data.friends || []));
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
    // eslint-disable-next-line
  }, [user]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(fetchFriends, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;
  if (error) return <div className="text-red-400 p-10 text-center">{error}</div>;

  const sorted = [...friends].sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-10 px-2 md:px-4">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Leaderboard</h1>
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-2 md:p-8 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="text-gray-400 text-lg">
              <th className="pb-4">#</th>
              <th className="pb-4">Avatar</th>
              <th className="pb-4">Name</th>
              {/* Removed Email column as per user request */}
              <th className="pb-4">Current Streak</th>
              <th className="pb-4">Longest Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => (
              <tr 
                key={f.id} 
                className={`border-b border-gray-700 last:border-none hover:bg-gray-800/60 transition ${
                  f.isCurrentUser ? 'bg-gradient-to-r from-lime-400/20 to-purple-400/20 border-l-4 border-lime-400' : ''
                }`}
              >
                <td className="py-3 text-lime-400 font-bold">{i + 1}</td>
                <td className="py-3">
                  {/* Prepend backend base URL if photo path exists and is relative */}
                  <img 
                    src={f.photo && !f.photo.startsWith("http") ? "http://localhost:5000" + f.photo : f.photo} 
                    alt={f.name} 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${
                      f.isCurrentUser ? 'border-purple-400' : 'border-lime-400'
                    }`} 
                  />
                </td>
                <td className="py-3 text-white font-semibold">
                  {f.name} {f.isCurrentUser && <span className="text-purple-400">(You)</span>}
                </td>
                {/* Removed Email cell as per user request */}
                <td className="py-3 text-lime-400 font-bold">{f.currentStreak || 0}</td>
                <td className="py-3 text-purple-400 font-bold">{f.longestStreak || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="text-gray-400 text-center py-8">No friends yet. Add some to compete!</div>}
        {sorted.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Your rank: #{sorted.findIndex(f => f.isCurrentUser) + 1} of {sorted.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 