import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const platformLabels = {
  leetcode: "LeetCode",
  gfg: "GeeksforGeeks",
  codeforces: "Codeforces",
  github: "GitHub",
};

const Friends = () => {
  const { user } = useUser();
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

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.uid;
      const res = await axiosInstance.get(`/users/friends/${userId}`);
      // Filter out current user from friends list
      // Filter out current user from friends list by comparing user._id and friend._id
      const filteredFriends = (res.data.friends || []).filter(friend => friend._id !== userId);
      setFriends(filteredFriends);
      setIncomingRequests(res.data.incomingRequests || []);
      setOutgoingRequests(res.data.outgoingRequests || []);
      setError(null);
    } catch (err) {
      setError("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFriends();
    // eslint-disable-next-line
  }, [user]);

  // Debounced search to reduce API calls
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchUsers = (query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`);
        // Filter out current user and existing friends
        const filteredResults = res.data.filter(result => 
          result.name !== user.name && 
          !friends.some(friend => friend.name === result.name)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300); // 300ms debounce delay

    setSearchTimeout(timeout);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setStatus("");
    setAdding(true);
    try {
      const res = await axiosInstance.post("/users/add-friend", {
        userName: user.displayName,  // Changed from user.uid to user.displayName
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
    setStatus("");
    setAdding(true);
    try {
      const res = await axiosInstance.post("/users/add-friend", {
        userName: user.displayName,  // Changed from user.uid to user.displayName
        friendName: friendUser.name,
      });
      setStatus(res.data.message || "Friend request sent!");
      setSearchResults([]);
      await fetchFriends();
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  const handleAcceptRequest = async (requester) => {
    setProcessingRequest(true);
    try {
      await axiosInstance.post("/users/accept-friend-request", {
        receiverId: user.uid,
        senderId: requester._id,
      });
      setStatus("Friend request accepted!");
      await fetchFriends();
    } catch (err) {
      setStatus("Failed to accept friend request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleDeclineRequest = async (requester) => {
    setProcessingRequest(true);
    try {
      await axiosInstance.post("/users/decline-friend-request", {
        receiverId: user.uid,
        senderId: requester._id,
      });
      setStatus("Friend request declined!");
      await fetchFriends();
    } catch (err) {
      setStatus("Failed to decline friend request");
    } finally {
      setProcessingRequest(false);
    }
  };

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;
  if (error) return <div className="text-red-400 p-10 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-10 px-2 md:px-4">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Friends</h1>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md flex flex-col items-center mb-10">
        <h3 className="text-lg text-gray-300 mb-4">Add Friend</h3>
        
        {/* Search Users */}
        <div className="w-full mb-4">
          <label className="block text-sm text-gray-300 mb-2">Search Users</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={(e) => {
              const query = e.target.value;
              if (query.length >= 2) {
                searchUsers(query);
              } else {
                setSearchResults([]);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          
          {/* Search Results */}
          {searching && (
            <div className="mt-2 text-gray-400 text-sm">Searching...</div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={result._id} className="flex items-center justify-between p-2 bg-gray-600 rounded mb-1">
                  <div className="flex items-center gap-2">
                    <img src={result.photo} alt={result.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-white text-sm font-medium">{result.name}</div>
                      <div className="text-gray-300 text-xs">{result.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFriendFromSearch(result)}
                    disabled={adding}
                    className="px-3 py-1 bg-lime-400 text-black text-xs rounded hover:bg-lime-300 transition disabled:opacity-60"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Add by Username */}
        <form onSubmit={handleAddFriend} className="w-full">
          <label className="block text-sm text-gray-300 mb-2">Or Add by Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFriend}
              onChange={e => setNewFriend(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              placeholder="Enter exact username"
            />
            <button
              type="submit"
              disabled={adding || !newFriend.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black font-bold hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
        
        {status && <div className="mt-4 text-lime-400 font-semibold text-center w-full">{status}</div>}
      </div>
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-4 md:p-8">
       
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Incoming Friend Requests</h2>
          {incomingRequests.length === 0 ? (
            <div className="text-gray-400 text-center">No incoming friend requests.</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {incomingRequests.map((requester, index) => (
                <li key={index} className="py-4 flex items-center gap-4 flex-col sm:flex-row">
                  {/* Prepend backend base URL if photo path exists and is relative */}
                  <img src={requester.photo && !requester.photo.startsWith("http") ? "http://localhost:5000" + requester.photo : requester.photo} alt={requester.name} className="w-12 h-12 rounded-full object-cover border-2 border-lime-400" />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-white font-semibold">{requester.name}</div>
                    <div className="text-blue-400 text-sm break-all">{requester.email}</div>
                    <div className="text-gray-400 text-sm italic">Wants to be your friend</div>
                  </div>
                  <div className="flex gap-4 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleAcceptRequest(requester)}
                      disabled={processingRequest}
                      className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(requester)}
                      disabled={processingRequest}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )} 
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Outgoing Friend Requests</h2>
          {outgoingRequests.length === 0 ? (
            <div className="text-gray-400 text-center">No outgoing friend requests.</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {outgoingRequests.map((requester, index) => (
                <li key={index} className="py-4 flex items-center gap-4 flex-col sm:flex-row">
                  {/* Prepend backend base URL if photo path exists and is relative */}
                  <img src={requester.photo && !requester.photo.startsWith("http") ? "http://localhost:5000" + requester.photo : requester.photo} alt={requester.name} className="w-12 h-12 rounded-full object-cover border-2 border-lime-400" />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-white font-semibold">{requester.name}</div>
                    <div className="text-blue-400 text-sm break-all">{requester.email}</div>
                    <div className="text-gray-400 text-sm italic">Request sent, awaiting response</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
