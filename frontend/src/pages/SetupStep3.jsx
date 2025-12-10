import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useUser } from "../context/UserContext";

const SetupStep3 = () => {
  const { user } = useUser();
  const [friendUsername, setFriendUsername] = useState("");
  const [dailyReminder, setDailyReminder] = useState(user?.alertSettings?.dailyReminder ?? true);
  const [reminderTime, setReminderTime] = useState(user?.alertSettings?.windowStart || "20:00");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddFriend = async () => {
    if (!friendUsername.trim() || !user?.name) return;
    try {
      await axiosInstance.post("/users/add-friend", { userName: user.name, friendName: friendUsername.trim() });
      setFriendUsername("");
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to send friend request");
    }
  };

  const addHoursToTime = (time, hours) => {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    date.setHours(date.getHours() + hours);
    return date.toTimeString().slice(0, 5);
  };

  const handleFinish = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      await axiosInstance.put(`/users/update-profile/${user._id}`, {
        alertSettings: {
          enabled: dailyReminder,
          windowStart: reminderTime,
          windowEnd: addHoursToTime(reminderTime, 2),
          notifyEmail: true,
          notifyPush: false,
          dailyReminder,
        },
        onboarded: true,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing setup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/setup/step2");

  return (
    <div className="bg-[#18181b] font-sans text-white min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 48 48">
              <path clipRule="evenodd" fill="currentColor" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
            </svg>
            <h1 className="text-xl font-bold">CodeStreak</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white">
              <span className="material-symbols-outlined">help</span>
            </button>
            <img
              alt="User avatar"
              className="h-10 w-10 rounded-full"
              src={
                user?.photo ||
                "https://avatars.githubusercontent.com/u/000?v=4"
              }
            />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 pt-[4.4rem] md:pt-[4.4rem] sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-400">Step 3 of 3</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Invite Friends & Notifications</h2>
            <p className="mt-4 text-lg text-neutral-400">Boost your motivation by adding friends and setting up reminders.</p>
          </div>

          <div className="mt-8 w-full h-2 bg-neutral-700 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: "100%" }}></div>
          </div>

          <div className="mt-10 bg-zinc-900 p-8 rounded-2xl space-y-10 shadow-lg">
            {/* Invite Friends */}
            <div>
              <h2 className="text-xl font-semibold">Invite Friends</h2>
              <p className="mt-1 text-sm text-zinc-400">Boost your motivation by adding friends.</p>

              <div className="mt-4 flex items-center space-x-2">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">person_add</span>
                  <input
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 pl-10 pr-16 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter username or email"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                  />
                  <button
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-600"
                    onClick={handleAddFriend}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Social Share Buttons — FIXED */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <span className="text-sm text-zinc-400">or share via:</span>

                <div className="flex gap-3">
                  {/* Twitter */}
                  <a
                    href="https://twitter.com/intent/tweet?text=Join%20me%20on%20CodeStreak!&url=https://codestreak.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.15 4.15 0 0 0 1.82-2.29c-.8.47-1.7.82-2.66 1A4.13 4.13 0 0 0 11.1 8a11.73 11.73 0 0 1-8.52-4.32 4.1 4.1 0 0 0 1.28 5.52c-.7-.02-1.37-.22-1.95-.54v.05a4.15 4.15 0 0 0 3.32 4.07c-.6.16-1.25.2-1.9.07a4.14 4.14 0 0 0 3.86 2.86A8.3 8.3 0 0 1 2 18.1a11.72 11.72 0 0 0 6.29 1.84c7.55 0 11.68-6.29 11.68-11.74 0-.18 0-.36-.01-.53A8.18 8.18 0 0 0 22.46 6z"/>
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/sharer/sharer.php?u=https://codestreak.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h2v3h-2c-.4 0-1 .2-1 1V12H16l-.5 3h-2v7A10 10 0 0 0 22 12z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/sharing/share-offsite/?url=https://codestreak.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5c0 1.38-1.08 2.49-2.5 2.49S0 4.88 0 3.5A2.5 2.5 0 0 1 2.48 1 2.5 2.5 0 0 1 5 3.5zM.3 22h4.3V7.9H.3V22zM8.4 7.9h4.1v1.9h.1c.6-1.2 2-2.4 4.2-2.4 4.5 0 5.3 3 5.3 6.8V22h-4.3v-6.3c0-1.5 0-3.4-2.1-3.4-2.2 0-2.5 1.7-2.5 3.3V22H8.4V7.9z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-zinc-400">Stay on track with personalized reminders.</p>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                  <div>
                    <p className="font-medium">Daily Reminder Notifications</p>
                    <p className="text-sm text-zinc-400">Get a nudge to keep your streak going.</p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      checked={dailyReminder}
                      type="checkbox"
                      className="peer sr-only"
                      onChange={(e) => setDailyReminder(e.target.checked)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] 
                      after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all 
                      peer-checked:bg-gradient-to-r peer-checked:from-lime-400 peer-checked:to-blue-400 
                      peer-checked:after:translate-x-full">
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                  <div className="flex items-center space-x-3">
                    <span className="material-symbols-outlined text-zinc-400">schedule</span>
                    <div>
                      <p className="font-medium">Reminder Time</p>
                      <p className="text-sm text-zinc-400">Choose when you get notified.</p>
                    </div>
                  </div>

                  <input
                    className="rounded-lg bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex justify-between">
            <button
              className="rounded-lg border border-zinc-700 px-6 py-2.5 font-bold text-zinc-300 hover:border-zinc-500 hover:text-white"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              disabled={loading}
              onClick={handleFinish}
              className="rounded-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition"
            >
              {loading ? "Finishing..." : "Finish Setup"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SetupStep3;
