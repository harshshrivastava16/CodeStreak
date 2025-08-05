import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [topPadding, setTopPadding] = useState(12);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const updatePadding = () => {
      if (window.innerWidth < 768) {
        setTopPadding(8);
      } else if (window.innerWidth < 1024) {
        setTopPadding(10);
      } else {
        setTopPadding(12);
      }
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  return (
    <div className={`min-h-screen bg-[#18181b] flex flex-col justify-start items-center px-6 pt-${topPadding} overflow-y-auto`}>
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

      <main className="flex flex-col md:flex-row items-center justify-between max-w-7xl w-full mt-16 gap-12">
        <section className="max-w-xl text-white">
          <h1 className="text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Streak?</span> Secured!
          </h1>
          <p className="text-gray-300 text-xl mb-8">
            Never miss a LeetCode POTD again. Compete with friends. Climb the leaderboard. Get notified. Stay consistent.
          </p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Get Started
          </Link>
        </section>

        <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 shadow-2xl w-96 text-center text-white">
          <div className="text-5xl font-bold mb-3">🔥 7</div>
          <div className="text-lg mb-6">Current POTD Streak</div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="bg-gray-700 rounded-xl px-5 py-3">Leaderboard: #3</div>
            <div className="bg-gray-700 rounded-xl px-5 py-3">Friends: 12</div>
          </div>
        </section>
      </main>

      <section className="mt-20 flex justify-center gap-20 text-center text-gray-400">
        <div className="flex flex-col items-center">

          <div className="text-4xl font-bold text-lime-400">100+</div>
          <div>Users Joined</div>
        </div>
        <div className="flex flex-col items-center">

          <div className="text-4xl font-bold text-blue-400">24/7</div>
          <div>Reminders</div>
        </div>
        <div className="flex flex-col items-center">

          <div className="text-4xl font-bold text-purple-400">∞</div>
          <div>Motivation</div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
