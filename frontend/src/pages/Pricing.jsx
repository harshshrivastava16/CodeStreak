import React, { useState } from "react";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Daily Problem Notifications",
      "Basic Leaderboard Access",
      "Add up to 3 Friends",
      "LeetCode Integration Only",
    ],
    badge: "Get Started",
  },
  {
    name: "Pro",
    price: "Launching Soon",
    features: [
      "Unlimited Friends",
      "Advanced Leaderboard & Insights",
      "Personalized Reminders",
      "All Platform Support (LeetCode, Codeforces, GFG, etc.)",
    ],
    badge: "Coming Soon",
    highlighted: true,
  },
];

const Pricing = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    console.log("Adding to waitlist:", email);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <>
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

      <div className="min-h-screen bg-[#18181b] text-white px-6 py-16 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>

        <div className="grid gap-10 md:grid-cols-2 mb-20">
          {pricingPlans.map(({ name, price, features, badge, highlighted }) => (
            <div
              key={name}
              className={`relative rounded-3xl p-8 shadow-xl transition-transform transform hover:scale-105 ${
                highlighted
                  ? "bg-gradient-to-br from-[#2e2e33] via-[#3b3b42] to-[#222222] ring-2 ring-purple-500"
                  : "bg-[#1f1f24]"
              }`}
            >
              {badge && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {badge}
                </div>
              )}

              <h2 className="text-3xl font-bold mb-2">{name}</h2>
              <p className="text-4xl font-extrabold mb-6">{price}</p>

              <ul className="space-y-3 text-gray-300 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="text-lime-400">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={name === "Pro"}
                className={`w-full py-3 text-lg font-semibold rounded-full transition ${
                  name === "Pro"
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "text-black bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 hover:brightness-110"
                }`}
              >
                {name === "Pro" ? "Coming Soon" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>

       
      </div>
    </>
  );
};

export default Pricing;
