import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Compare = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axiosInstance.get(`/users/friends/${user._id}`);
        setFriends(res.data.friends || []);
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };

    if (user) {
      fetchFriends();
    }
  }, [user]);

  const handleUserSelect = (friend) => {
    if (selectedUsers.find(u => u._id === friend._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== friend._id));
    } else if (selectedUsers.length < 3) {
      setSelectedUsers([...selectedUsers, friend]);
    }
  };

  const handleCompare = async () => {
    if (selectedUsers.length < 1) {
      setError("Please select at least one user to compare");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Mock comparison data - in real implementation, this would come from backend
      const mockComparison = {
        users: selectedUsers.map(user => ({
          ...user,
          stats: {
            currentStreak: user.currentStreak || 0,
            longestStreak: user.longestStreak || 0,
            totalProblems: user.totalProblems || 0,
            platforms: user.platforms || []
          }
        })),
        insights: [
          "User A has a higher current streak",
          "User B solves more problems overall",
          "User C has better consistency"
        ]
      };

      setComparisonData(mockComparison);
    } catch (err) {
      setError("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  const clearComparison = () => {
    setSelectedUsers([]);
    setComparisonData(null);
    setError("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-white">Please log in to compare users.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white">
      <div className="relative flex size-full min-h-screen flex-row bg-background dark group/design-root overflow-x-hidden">
        <Sidebar variant="leaderboard" />
        <main className="flex-1 flex-col  pt-[4.4rem] md:pt-[4.4rem] px-6 py-8 md:px-10 md:py-12">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-8">
              <button
                onClick={() => navigate('/leaderboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Leaderboard
              </button>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">Compare Users</h1>
              <p className="mt-2 text-lg text-gray-400">Compare coding stats with your friends.</p>
            </div>

            {!comparisonData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Selection */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <h2 className="text-2xl font-bold mb-4">Select Users to Compare</h2>
                  <p className="text-gray-400 mb-6">Choose up to 3 friends to compare their coding statistics.</p>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {friends.map((friend) => (
                      <div
                        key={friend._id}
                        onClick={() => handleUserSelect(friend)}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedUsers.find(u => u._id === friend._id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={
                            friend.photo && !friend.photo.startsWith("http")
                              ? "http://localhost:5000" + friend.photo
                              : friend.photo || "https://via.placeholder.com/40"
                          }
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-sm text-gray-400">
                            Current Streak: {friend.currentStreak || 0}
                          </p>
                        </div>
                        {selectedUsers.find(u => u._id === friend._id) && (
                          <span className="material-symbols-outlined text-blue-500">check_circle</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {friends.length === 0 && (
                    <div className="text-gray-400 text-center py-8">
                      No friends to compare with. Add some friends first!
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleCompare}
                      disabled={selectedUsers.length === 0 || loading}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-lime-400 to-blue-500 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Comparing..." : `Compare ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>

                {/* Selected Users Preview */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <h2 className="text-2xl font-bold mb-4">Selected Users</h2>

                  {selectedUsers.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No users selected yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedUsers.map((user, index) => (
                        <div key={user._id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lime-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm">
                            {index + 1}
                          </div>
                          <img
                            src={
                              user.photo && !user.photo.startsWith("http")
                                ? "http://localhost:5000" + user.photo
                                : user.photo || "https://via.placeholder.com/40"
                            }
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400">Streak: {user.currentStreak || 0}</p>
                          </div>
                          <button
                            onClick={() => handleUserSelect(user)}
                            className="ml-auto text-red-400 hover:text-red-300"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Comparison Results */
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Comparison Results</h2>
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    New Comparison
                  </button>
                </div>

                {/* Stats Comparison Table */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold">Statistics Comparison</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Current Streak</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Longest Streak</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Total Problems</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {comparisonData.users.map((user, index) => (
                          <tr key={user._id} className="hover:bg-gray-700/20">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    user.photo && !user.photo.startsWith("http")
                                      ? "http://localhost:5000" + user.photo
                                      : user.photo || "https://via.placeholder.com/40"
                                  }
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-orange-400 font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">local_fire_department</span>
                                {user.currentStreak || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-blue-400">{user.longestStreak || 0}</td>
                            <td className="px-6 py-4 text-green-400">{user.totalProblems || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4">Insights</h3>
                  <div className="space-y-3">
                    {comparisonData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <span className="material-symbols-outlined text-blue-400 mt-0.5">lightbulb</span>
                        <p className="text-gray-300">
                          {typeof insight === 'string'
                            ? insight
                            : `Streak: ${insight.streak || 0}, Total Active Days: ${insight.totalActiveDays || 0}`
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Compare;
