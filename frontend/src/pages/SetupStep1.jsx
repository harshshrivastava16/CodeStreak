import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useUser } from "../context/UserContext";

const SetupStep1 = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([
    { platform: "leetcode", name: "LeetCode", username: "", status: "not_connected" },
    { platform: "codeforces", name: "Codeforces", username: "", status: "not_connected" },
    { platform: "gfg", name: "GeeksForGeeks", username: "", status: "not_connected" },
    { platform: "hackerrank", name: "HackerRank", username: "", status: "not_connected" },
  ]);

  useEffect(() => {
    if (user?.platforms) {
      setPlatforms(prev =>
        prev.map(p => {
          const existing = user.platforms.find(up => up.platform === p.platform);
          return existing
            ? { ...p, username: existing.username, status: "connected" }
            : p;
        })
      );
    }
  }, [user]);

  const validateUsername = async (platform, username) => {
    try {
      const response = await axiosInstance.get(`/users/validate/${platform}/${username}`);
      return response.data.valid;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const updatePlatform = async (platform, username) => {
    try {
      await axiosInstance.put(`/users/update-platforms/${user._id}`, { platform, username });
      return true;
    } catch (error) {
      console.error("Update error:", error);
      return false;
    }
  };

  const handleConnect = async (index) => {
    const platform = platforms[index];
    const username = platform.username.trim();
    if (!username) return;

    setPlatforms(prev =>
      prev.map((p, i) => i === index ? { ...p, status: "loading" } : p)
    );

    const isValid = await validateUsername(platform.platform, username);
    if (isValid) {
      const updated = await updatePlatform(platform.platform, username);
      if (updated) {
        setPlatforms(prev =>
          prev.map((p, i) => i === index ? { ...p, status: "connected" } : p)
        );
      } else {
        setPlatforms(prev =>
          prev.map((p, i) => i === index ? { ...p, status: "failed" } : p)
        );
      }
    } else {
      setPlatforms(prev =>
        prev.map((p, i) => i === index ? { ...p, status: "failed" } : p)
      );
    }
  };

  const getStatusText = (platform) => {
    if (platform.status === "connected") {
      return `username: ${platform.username}`;
    } else if (platform.status === "failed") {
      return "Connection failed. Please try again.";
    } else {
      return "Not connected yet.";
    }
  };

  const getButtonText = (platform) => {
    if (platform.status === "connected") {
      return "Connected";
    } else if (platform.status === "loading") {
      return "Connecting...";
    } else if (platform.status === "failed") {
      return "Retry";
    } else {
      return "Connect";
    }
  };

  const getButtonClass = (platform) => {
    if (platform.status === "connected") {
      return "flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600";
    } else if (platform.status === "failed") {
      return "flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600";
    } else {
      return "rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-600)]";
    }
  };

  const getButtonIcon = (platform) => {
    if (platform.status === "connected") {
      return <span className="material-symbols-outlined">check_circle</span>;
    } else if (platform.status === "failed") {
      return <span className="material-symbols-outlined">error</span>;
    }
    return null;
  };

  return (
    <>
      <style type="text/tailwindcss">
        {`
          :root {
            --primary-500: #137fec;
            --primary-600: #0b69c4;
            --primary-700: #0a56a0;
            --neutral-800: #1f2937;
            --neutral-700: #374151;
            --neutral-600: #4b5563;
            --neutral-500: #6b7280;
            --neutral-400: #9ca3af;
            --neutral-300: #d1d5db;
            --neutral-200: #e5e7eb;
            --neutral-100: #f3f4f6;
            --neutral-50: #f9fafb;
            --background: #111827;
          }
          .progress-bar-container {
            @apply w-full bg-neutral-700 rounded-full h-2;
          }
          .progress-bar {
            @apply bg-[var(--primary-500)] h-2 rounded-full;
          }
        `}
      </style>
      <div className="bg-[#18181b] font-sans text-white">
        <div className="flex flex-col min-h-screen">
        <header className="border-b border-neutral-800 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-[var(--primary-500)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
              <h1 className="text-xl font-bold">CodeStreak</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <span className="material-symbols-outlined">help</span>
              </button>
              <img alt="User avatar" className="h-10 w-10 rounded-full" src={user?.photo || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrMkP-E25hdQXjYKewPjqSeZxRu5Vk1_GCTxxqIOgiUuxySDv5DO0UhUTsXPXaIkvA-neerwLDpR6hMXcGViZkbF1L_iIBnpKhksfG1hInNQIsVXxS7M3FjZYnNFs4IC4FhHyX8TLhXiR8eVF7jvAgXzK2T91s9zm_xmfpWil2l7vyPcN2ChGWYN9_DezsiWG5cMYx18smUKSN2zI6VHvhKM4jRsSANRL-2_MaCoRHkCNU9PK2P96Ss7Qog3y6cjP6p4Px5HTpces"} />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4  pt-[4.4rem] md:pt-[4.4rem] sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--primary-500)]">Step 1 of 3</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Connect Your Coding Platforms</h2>
              <p className="mt-4 text-lg text-neutral-400">Integrate your accounts to see a unified view of your coding practice. You can always connect more later.</p>
            </div>
            <div className="mt-8">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: "33%" }}></div>
              </div>
            </div>
            <div className="mt-10 bg-zinc-900 p-8 rounded-2xl">
              <div className="space-y-4">
                {platforms.map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between rounded-lg bg-zinc-800 p-4 transition-all hover:bg-zinc-700">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700">
                        <span className="material-symbols-outlined text-3xl text-neutral-300">code</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{platform.name}</h3>
                        <p className={`text-sm ${platform.status === "connected" ? "text-green-400 font-medium" : platform.status === "failed" ? "text-red-400" : "text-neutral-400"}`}>
                          {getStatusText(platform)}
                        </p>
                        {platform.status !== "connected" && (
                          <input
                            type="text"
                            placeholder="Enter username"
                            value={platform.username}
                            onChange={(e) => setPlatforms(prev => prev.map((p, i) => i === index ? { ...p, username: e.target.value } : p))}
                            className="mt-2 w-full px-3 py-1 bg-zinc-700 text-white rounded-md text-sm"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      className={getButtonClass(platform)}
                      onClick={() => handleConnect(index)}
                      disabled={platform.status === "loading" || platform.status === "connected"}
                    >
                      {getButtonIcon(platform)}
                      {getButtonText(platform)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 flex justify-between">
              <button className="rounded-md bg-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-600" onClick={() => navigate("/setup/step2")}>
                Skip for Now
              </button>
              <button className="rounded-md bg-[var(--primary-500)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-600)]" onClick={() => navigate("/setup/step2")}>
                Continue
              </button>
            </div>
          </div>
        </main>
        </div>
      </div>
    </>
  );
};

export default SetupStep1;
