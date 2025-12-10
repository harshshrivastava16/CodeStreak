import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useUser } from "../context/UserContext";

const SetupStep2 = () => {
  const { user, setUser } = useUser();
  const [goalType, setGoalType] = useState(user?.dailyGoalType || "problems");
  const [goalNumber, setGoalNumber] = useState(user?.dailyGoalNumber || 3);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Update user daily goal
      const res = await axiosInstance.put(`/users/update-profile/${user._id}`, { dailyGoalType: goalType, dailyGoalNumber: goalNumber });
      // Update user context
      if (res.data?.user) {
        setUser(res.data.user);
      }
      // Proceed to next step
      navigate("/setup/step3");
    } catch (error) {
      console.error("Error setting daily goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/setup/step1");
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
        <main className="flex-grow container mx-auto px-4 pt-[4.4rem] md:pt-[4.4rem] sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--primary-500)]">Step 2 of 3</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Set Your Daily Goal</h2>
              <p className="mt-4 text-lg text-neutral-400">Consistency is key. Choose a daily goal that challenges you yet feels achievable. Every line of code is a step forward.</p>
            </div>
            <div className="mt-8">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: "66%" }}></div>
              </div>
            </div>
            <div className="mt-10 bg-zinc-900 p-8 rounded-2xl space-y-8">
              <div className="flex justify-center gap-4">
                <label className="w-full cursor-pointer">
                  <input
                    checked={goalType === "problems"}
                    className="peer sr-only"
                    name="goalType"
                    type="radio"
                    value="problems"
                    onChange={(e) => setGoalType(e.target.value)}
                  />
                  <div className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    goalType === "problems"
                      ? "border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                      : "border-zinc-700"
                  }`}>
                    <span className="material-symbols-outlined text-lime-400">checklist</span>
                    <span className="text-white">Problems</span>
                  </div>
                </label>
                <label className="w-full cursor-pointer">
                  <input
                    checked={goalType === "minutes"}
                    className="peer sr-only"
                    name="goalType"
                    type="radio"
                    value="minutes"
                    onChange={(e) => setGoalType(e.target.value)}
                  />
                  <div className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    goalType === "minutes"
                      ? "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "border-zinc-700"
                  }`}>
                    <span className="material-symbols-outlined text-blue-400">timer</span>
                    <span className="text-white">Minutes</span>
                  </div>
                </label>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between text-white">
                  <span className="text-lg font-medium capitalize">{goalType}</span>
                  <span className="text-lg font-bold">{goalNumber}</span>
                </div>
                <div className="relative w-full">
                  <input
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer range-lg accent-gradient"
                    max="10"
                    min="1"
                    onChange={(e) => setGoalNumber(e.target.value)}
                    style={{
                      background: `linear-gradient(to right, #a3e635, #3b82f6, ${goalNumber / 10 * 100}%, #374151 ${goalNumber / 10 * 100}%)`
                    }}
                    type="range"
                    value={goalNumber}
                  />
                </div>
                <div className="flex justify-between text-zinc-400 text-sm">
                  <span>1 {goalType.slice(0, -1)}</span>
                  <span>10+ {goalType}</span>
                </div>
              </div>
              <p className="text-zinc-500 italic text-sm">
                "The journey of a thousand miles begins with a single step." Tackling {goalNumber} {goalType} a day keeps you sharp and on track.
              </p>
            </div>
            <div className="mt-12 flex justify-between">
              <button
                className="px-6 py-3 rounded-xl text-white font-semibold border border-zinc-700 hover:bg-zinc-800 transition-colors"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                className="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-90 transition-opacity"
                disabled={loading}
                onClick={handleNext}
              >
                {loading ? "Saving..." : "Next"}
              </button>
            </div>
          </div>
        </main>
        </div>
      </div>
    </>
  );
};

export default SetupStep2;
