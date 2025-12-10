import React from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const Pricing = () => {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#0A0A0C] text-white overflow-x-hidden"
      style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}
    >
      <PublicNavbar />

      {/* Apple-style lighting */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-purple-500/10 via-blue-400/10 to-white/5 blur-[160px] opacity-60"></div>
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] rounded-full bg-purple-300/10 blur-[160px] opacity-40"></div>
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[160px] opacity-40"></div>

      <main className="flex-1 pt-[5rem] pb-24 px-6 sm:px-10 lg:px-20 relative z-10">

        {/* HEADER */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-5 text-lg text-gray-400 max-w-2xl mx-auto">
            Unlock your coding superpower with flexible pricing designed for growth.
          </p>
        </div>

        {/* PRICING GRID */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">

          {/* BASE PLAN */}
          <div className="
            group relative p-10 rounded-3xl
            bg-white/5 border border-white/10 backdrop-blur-xl
            shadow-[0_20px_80px_rgba(0,0,0,0.4)]
            hover:bg-white/10 hover:shadow-[0_30px_120px_rgba(0,0,0,0.5)]
            transition-all duration-300
          ">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-white">Base</h2>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-lime-400/15 text-lime-300">
                Student-Friendly
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-extrabold text-white">$0</span>
              <span className="text-xl text-gray-400">/mo</span>
            </div>

            <p className="mt-4 text-gray-400">
              Perfect for beginners exploring the core features of CodeStreak.
            </p>

            <Link
              to="/login"
              className="
                mt-8 flex w-full justify-center items-center h-12
                rounded-xl bg-white/10 text-white font-semibold
                hover:bg-white/20 transition-all
              "
            >
              Start for Free
            </Link>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4">
              {[
                "Daily Problem Notifications",
                "Basic Leaderboard Access",
                "Connect with up to 3 Friends",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <svg className="text-lime-400" fill="currentColor" height="22" viewBox="0 0 256 256" width="22">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="
            group relative p-10 rounded-3xl border-2 border-purple-500
            bg-white/5 backdrop-blur-xl
            shadow-[0_20px_80px_rgba(88,28,255,0.4)]
            hover:shadow-[0_30px_140px_rgba(88,28,255,0.5)]
            hover:-translate-y-1 transition-all duration-300
          ">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-white">Pro</h2>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-400/20 text-purple-300">
                Popular
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-extrabold text-white">$4.99</span>
              <span className="text-xl text-gray-400">/mo</span>
            </div>

            <p className="mt-4 text-gray-400">
              Supercharge your coding with advanced tools and unlimited connections.
            </p>

            <Link
              to="/login"
              className="
                mt-8 flex w-full justify-center items-center h-12
                rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600
                text-white font-semibold
                hover:opacity-90 transition-all
              "
            >
              Go Pro
            </Link>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4">
              {[
                "Unlimited Friends",
                "Advanced Leaderboard Stats",
                "Custom Streak Alerts",
                "Multi-Platform Syncing",
                "AI-Driven Insights",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <svg className="text-lime-400" fill="currentColor" height="22" viewBox="0 0 256 256" width="22">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
