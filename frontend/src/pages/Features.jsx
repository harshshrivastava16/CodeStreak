import React from "react";
import { motion } from "framer-motion";
import PublicNavbar from "../components/PublicNavbar";

const featuresList = [
  {
    title: "Daily Problem Notifications",
    description:
      "Smart algorithmically-timed alerts that keep your streak unbreakable — without overwhelming you.",
    icon: "🔥",
  },
  {
    title: "Compete with Friends",
    description:
      "See where you stand with beautifully minimal leaderboards designed for healthy motivation.",
    icon: "👥",
  },
  {
    title: "Personalized Reminders",
    description:
      "AI-calibrated reminders based on when you're most focused. Your habit, optimized.",
    icon: "⏰",
  },
  {
    title: "Multi-Platform Sync",
    description:
      "Your streaks travel with you — synced instantly across all devices with zero friction.",
    icon: "📱",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen relative bg-[#0A0A0C] text-white overflow-x-hidden">

      <PublicNavbar />

      {/* Apple-style background lighting */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-white/10 via-purple-400/10 to-blue-300/10 blur-[180px] opacity-70"></div>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-white/5 rounded-full blur-[200px] opacity-50"></div>
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-lime-300/10 rounded-full blur-[160px] opacity-40"></div>
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-[160px] opacity-40"></div>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random(),
          }}
          animate={{
            y: "-20vh",
            opacity: 0,
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Main content */}
      <main className="px-6 sm:px-12 md:px-24 lg:px-48 pt-[6rem] pb-32 max-w-7xl mx-auto relative z-10 select-none">

        {/* FIXED HEADING (no clipping now) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="
            text-5xl sm:text-6xl font-semibold text-center mb-0 pb-5
            bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent
            tracking-tight leading-[1.15] overflow-visible
          "
        >
          Powerful Features.
          <br />
          Designed with Care.
          
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-center text-zinc-400 max-w-2xl mx-auto mb-20 text-lg font-light"
        >
          Built with the same obsessive attention to detail found in CodeStreak products.
        </motion.p>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {featuresList.map(({ title, description, icon }, index) => (
            <motion.div
              key={index}
              className="
                group relative rounded-3xl p-10
                bg-white/5 border border-white/10 backdrop-blur-2xl
                shadow-[0_20px_80px_rgba(0,0,0,0.35)]
                hover:bg-white/10 hover:shadow-[0_30px_100px_rgba(0,0,0,0.45)]
                transition-all cursor-pointer
              "
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, type: "spring", stiffness: 90 }}
              whileHover={{ scale: 1.04 }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-10 blur-3xl transition-all pointer-events-none"></div>

              {/* Icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-inner flex items-center justify-center text-4xl"
                whileHover={{ rotate: 6, scale: 1.06 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {icon}
              </motion.div>

              {/* Text */}
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                  {title}
                </h2>
                <p className="text-zinc-300 font-light leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Features;
