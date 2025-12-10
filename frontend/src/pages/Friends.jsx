import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const tabs = ["Friends", "Incoming Requests", "Outgoing Requests"];

const Friends = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [newFriend, setNewFriend] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("Friends");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users/friends/${user._id}`);
      setFriends((res.data.friends || []).filter(f => f._id !== user._id));
      setIncomingRequests(res.data.incomingRequests || []);
      setOutgoingRequests(res.data.outgoingRequests || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load friends:", err);
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  const searchUsers = (query) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`);
        setSearchResults(res.data.filter(
          result => result.name !== user.name &&
          !friends.some(f => f.name === result.name)
        ));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setStatus("");
    setAdding(true);
    try {
      const res = await axiosInstance.post("/users/add-friend", {
        userName: user.name,
        friendName: newFriend,
      });
      setStatus(res.data.message || "Friend request sent!");
      setNewFriend("");
      setSearchResults([]);
      await fetchFriends();
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  const handleAddFriendFromSearch = async (friendUser) => {
    setAdding(true);
    try {
      await axiosInstance.post("/users/add-friend", {
        userName: user.name,
        friendName: friendUser.name,
      });
      setStatus("Friend request sent!");
      await fetchFriends();
    } catch {
      setStatus("Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  const handleAcceptRequest = async (requester) => {
    setProcessingRequest(true);
    try {
      await axiosInstance.post("/users/accept-friend-request", {
        receiverId: user._id,
        senderId: requester._id,
      });
      setStatus("Friend request accepted!");
      await fetchFriends();
    } catch {
      setStatus("Failed to accept friend request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleDeclineRequest = async (requester) => {
    setProcessingRequest(true);
    try {
      await axiosInstance.post("/users/decline-friend-request", {
        receiverId: user._id,
        senderId: requester._id,
      });
      setStatus("Friend request declined!");
      await fetchFriends();
    } catch {
      setStatus("Failed to decline friend request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setProcessingRequest(true);
    try {
      await axiosInstance.post("/users/remove-friend", {
        userId: user._id,
        friendId,
      });
      setStatus("Friend removed!");
      await fetchFriends();
    } catch {
      setStatus("Failed to remove friend");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleShowProfile = (friend) => {
    setSelectedProfile(friend);
    setShowProfileModal(true);
  };

  const handleViewFullProfile = () => {
    if (selectedProfile) {
      navigate(`/profile/${selectedProfile._id}`);
      setShowProfileModal(false);
    }
  };

  if (loading)
    return (
     <Loader/>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111827]">
        <div className="rounded-xl bg-red-500/10 border border-red-500/50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-400 mb-1">Error Fetching Data</h2>
          <p className="text-zinc-400">Please refresh or try again later.</p>
        </div>
      </div>
    );

  const getActiveList = () => {
    if (activeTab === "Friends") return friends;
    if (activeTab === "Incoming Requests") return incomingRequests;
    if (activeTab === "Outgoing Requests") return outgoingRequests;
    return [];
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white overflow-hidden">
      {/* === Background Layers (Copied exactly from Profile.jsx) === */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-purple-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/10 via-purple-400/10 to-lime-400/10 rounded-full blur-[120px]"></div>
      </div>

      {/* === Sidebar === */}
      <Sidebar variant="friends" />

      {/* === Main Content === */}
      <main className="relative z-10 flex-1 p-8 md:p-10 overflow-y-auto pt-24 md:pt-24 md:pl-52">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div>
            <h1 className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent text-4xl font-bold tracking-tight mb-2">
              Friends
            </h1>
            <p className="text-zinc-400 text-sm">Manage your connections and requests.</p>
          </div>

          {/* Add Friend Section */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add a New Friend</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
                <input
                  type="search"
                  placeholder="Search for users..."
                  onChange={(e) => {
                    const query = e.target.value;
                    if (query.length >= 2) searchUsers(query);
                    else setSearchResults([]);
                  }}
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-zinc-800/70 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-400"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-lg">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={result._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${result.photo && !result.photo.startsWith("http") ? "http://localhost:5000" + result.photo : result.photo}")`,
                            }}
                          />
                          <div>
                            <p className="font-medium text-white">{result.name}</p>
                            <p className="text-xs text-zinc-400">{result.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddFriendFromSearch(result)}
                          disabled={adding}
                          className="rounded-md px-4 py-2 text-xs font-semibold bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 hover:opacity-90 disabled:opacity-60"
                        >
                          Add
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={newFriend}
                  onChange={(e) => setNewFriend(e.target.value)}
                  className="flex-grow h-12 px-4 rounded-lg bg-zinc-800/70 text-white placeholder-zinc-500 focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  onClick={handleAddFriend}
                  disabled={adding || !newFriend.trim()}
                  className="h-12 px-6 rounded-lg bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 text-sm font-semibold text-zinc-900 hover:opacity-90 disabled:opacity-60"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
            {status && (
              <div className="mt-4 p-3 text-center rounded-lg bg-green-500/10 text-green-400 border border-green-400/30">
                {status}
              </div>
            )}
          </div>

          {/* Tabs Section */}
          <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-md shadow-lg p-6">
            <div className="border-b border-zinc-800 mb-6">
              <nav className="flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium transition-all border-b-2 ${
                      activeTab === tab
                        ? "border-transparent bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent border-b-[2px]"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getActiveList().length === 0 ? (
                <div className="col-span-full text-center text-zinc-500 py-8">
                  {activeTab === "Friends"
                    ? "No friends yet. Add some to compete!"
                    : activeTab === "Incoming Requests"
                    ? "No incoming requests."
                    : "No outgoing requests."}
                </div>
              ) : (
                getActiveList().map((userItem, index) => (
                  <motion.div
                    key={userItem._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 backdrop-blur-md shadow-md border border-transparent hover:border-cyan-400/20 transition-all duration-300 text-center"
                  >
                    <div
                      className="mx-auto h-20 w-20 mb-4 rounded-full bg-cover bg-center ring-2 ring-cyan-400/50"
                      style={{
                        backgroundImage: `url("${userItem.photo && !userItem.photo.startsWith("http") ? "http://localhost:5000" + userItem.photo : userItem.photo}")`,
                      }}
                    ></div>
                    <p className="font-semibold text-white">{userItem.name}</p>
                    <p className="text-sm text-zinc-400 mb-4">{userItem.email}</p>

                    <div className="flex flex-col gap-2">
                      {activeTab === "Friends" && (
                        <>
                          <button
                            onClick={() => handleRemoveFriend(userItem._id)}
                            disabled={processingRequest}
                            className="w-full rounded-md py-2 bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30"
                          >
                            Remove Friend
                          </button>
                          <button
                            onClick={() => handleShowProfile(userItem)}
                            className="w-full rounded-md py-2 bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30"
                          >
                            View Profile
                          </button>
                        </>
                      )}

                      {activeTab === "Incoming Requests" && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(userItem)}
                            className="w-full rounded-md py-2 bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(userItem)}
                            className="w-full rounded-md py-2 bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {activeTab === "Outgoing Requests" && (
                        <span className="rounded-full bg-yellow-400/10 text-yellow-400 px-3 py-1 text-xs font-medium">
                          Pending...
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900/90 rounded-2xl p-8 shadow-2xl border border-zinc-800 text-center"
          >
            <img
              src={
                selectedProfile.photo && !selectedProfile.photo.startsWith("http")
                  ? "http://localhost:5000" + selectedProfile.photo
                  : selectedProfile.photo || "https://via.placeholder.com/96"
              }
              alt={selectedProfile.name}
              className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-cyan-400/50 mb-4"
            />
            <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
            <p className="text-zinc-400 mb-6">Competitive Coder</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[{ label: "Problems", value: "250" }, { label: "Contests", value: "120" }, { label: "Achievements", value: "30" }].map((stat, i) => (
                <div key={i} className="rounded-lg bg-zinc-800/50 p-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 rounded-lg bg-zinc-800 py-3 font-semibold hover:bg-zinc-700"
              >
                Close
              </button>
              <button
                onClick={handleViewFullProfile}
                className="flex-1 rounded-lg bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 text-zinc-900 font-semibold py-3 hover:opacity-90"
              >
                View Full Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Friends;
