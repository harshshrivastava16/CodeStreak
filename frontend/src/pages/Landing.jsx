import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const Landing = () => {
  const [topPadding, setTopPadding] = useState(20);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    const updatePadding = () => {
      if (window.innerWidth < 768) setTopPadding(32);
      else if (window.innerWidth < 1024) setTopPadding(44);
      else setTopPadding(60);
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white overflow-x-hidden font-sans">

      <PublicNavbar />

      {/* APPLE-LIKE BACKLIGHT */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-purple-600/10 to-black/90 blur-[140px] opacity-70"></div>

      {/* HERO */}
      <main className={`px-6 sm:px-12 md:px-24 lg:px-48 pt-${topPadding}`}>

        <section className="flex flex-col items-center text-center max-w-5xl mx-auto mt-14 relative">

          {/* FLOATING LIGHTS */}
          <div className="absolute pointer-events-none animate-pulse top-40 left-[20%] w-72 h-72 bg-purple-500/20 blur-3xl rounded-full"></div>
          <div className="absolute pointer-events-none animate-pulse top-72 right-[20%] w-60 h-60 bg-blue-400/20 blur-3xl rounded-full delay-200"></div>

          {/* TITLE */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold leading-tight tracking-tight fade-in">
            <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              Build. Improve.
            </span>
            <br />
            <span className="bg-gradient-to-r from-lime-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
              Stay Consistent.
            </span>
          </h1>

          {/* SUBTEXT */}
          <p className="text-zinc-400 mt-7 text-xl max-w-2xl font-light fade-in-delayed">
            Track your coding streaks, unlock achievements, and grow effortlessly — 
            with a beautifully crafted interface designed for consistency.
          </p>

          {/* CTA BUTTON */}
          <Link
            to="/login"
            className="mt-12 flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-white text-black font-semibold text-lg shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] hover:scale-105 transition-all"
          >
            Begin Your Streak
          </Link>
        </section>

        {/* MACBOOK MOCKUP */}
        <section className="relative mt-32 w-full max-w-4xl mx-auto">

          {/* BACKLIGHT */}
          <div className="absolute inset-0 -z-10 bg-white/10 blur-[100px] opacity-50"></div>

          {/* FRAME */}
          <div className="relative rounded-[32px] overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-[#0F0F0F]">

            {/* Traffic light bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A]">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>

            <img
              src="/cdimg.png"
              alt="CodeStreak Dashboard Mockup"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* NEW PREMIUM STATS SECTION */}
        <section className="mt-40 max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-semibold mb-4">Crafted for Momentum.</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            Powering your growth with real-time analytics, reminders, and competitive insights.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-20">

            {/* CARD 1 */}
            <div className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-zinc-400 text-sm font-light">Developers Joined</p>
              <p className="text-5xl font-bold mt-1 bg-gradient-to-r from-lime-300 to-white bg-clip-text text-transparent">
                12K+
              </p>
            </div>

            {/* CARD 2 */}
            <div className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
              <div className="text-5xl mb-4">🔥</div>
              <p className="text-zinc-400 text-sm font-light">Leaderboard Heat</p>
              <p className="text-5xl font-bold mt-1 bg-gradient-to-r pb-2 from-blue-300 to-white bg-clip-text text-transparent">
                High
              </p>
            </div>

            {/* CARD 3 */}
            <div className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
              <div className="text-5xl mb-4">🔔</div>
              <p className="text-zinc-400 text-sm font-light">Daily Reminders</p>
              <p className="text-5xl font-bold mt-1 bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">
                Active
              </p>
            </div>

          </div>
        </section>
      </main>

      <div className="h-40" />
    </div>
  );
};

export default Landing;
