import React from "react";

const featuresList = [
  {
    title: "Daily Problem Notifications",
    description: "Get notified every day with the latest LeetCode Problem of the Day so you never miss a challenge.",
    icon: "🔥",
  },
  {
    title: "Compete with Friends",
    description: "Add friends, compare streaks, and climb the leaderboard together for extra motivation.",
    icon: "👥",
  },
  {
    title: "Personalized Reminders",
    description: "Set reminders tailored to your schedule to keep your coding streak alive.",
    icon: "⏰",
  },
  {
    title: "Multi-Platform Support",
    description: "Access your streaks and notifications across devices seamlessly.",
    icon: "📱",
  },
];

const Features = () => (
  <>
    {/* Navbar */}
     <nav className="w-full px-6 py-6 bg-[#18181b] border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a
            href="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            CodeStreak
          </a>
          <div className="space-x-8 text-lg font-medium hidden sm:flex">
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Contact Us", href: "/contact-us" }
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>


    {/* Features Section */}
    <div className="min-h-screen bg-[#18181b] text-white px-6 py-16 max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
        What You Get?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {featuresList.map(({ title, description, icon }) => (
          <div
            key={title}
            className="bg-[#212121] rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex items-start gap-6 hover:scale-[1.03]"
          >
            <div className="text-3xl sm:text-4xl flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-lime-400 via-blue-400 to-purple-500 text-black font-bold shadow-inner">
              {icon}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default Features;
