/**
 * FakePayment.jsx
 *
 * Dark glassmorphism dashboard-style payment page.
 * - Matches Profile.jsx background + neon gradient look.
 * - Subtle motion, soft shadows, and adaptive light/dark theme.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";

const PRIMARY_GRADIENT = "from-lime-400/90 via-cyan-400/90 to-purple-400/90";

export default function FakePayment() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: user?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/payments/fake', {
        paymentId: `fake_pay_${Date.now()}`,
        fakeCardNumber: formData.cardNumber,
        userId: user._id
      });

      // Update user state with the new subscription
      setUser({ ...user, subscription: response.data.subscription });
      alert("Congratulations on becoming a pro member!");
      navigate("/dashboard");
    } catch (err) {
      setError("Upgrade failed");
    } finally {
      setLoading(false);
    }
  };
  const total = 4.99;
  const theme = user?.settings?.theme || "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "light"
          ? "bg-gradient-to-b from-white to-zinc-100 text-black"
          : "bg-gradient-to-b from-[#111827] to-[#1a1a1a] text-white"
      }`}
    >
      <Sidebar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 md:ml-56 pt-[6.4rem] md:pt-[6.4rem]">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1
              className={`text-3xl font-extrabold tracking-tight ${
                theme === "light"
                  ? "text-zinc-900"
                  : "bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
              }`}
            >
              Upgrade to Pro
            </h1>
            <p
              className={`text-sm ${
                theme === "light" ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              Secure your subscription — all transactions are encrypted.
            </p>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Order Summary */}
          <div
            className={`p-6 rounded-2xl ${
              theme === "light" ? "bg-white/70" : "bg-zinc-900/70"
            } backdrop-blur-md shadow-md`}
          >
            <h2 className="text-2xl font-semibold mb-6">Subscription Summary</h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-purple-400/10">
              <div className="w-16 h-16 bg-gradient-to-br from-lime-400 via-cyan-400 to-purple-400 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-xl">PRO</span>
              </div>
              <div>
                <h3 className="font-medium">CodeStreak Pro</h3>
                <p className="text-zinc-400 text-sm">Monthly Subscription</p>
                <p className="text-lime-400 font-semibold mt-1">
                  ${total.toFixed(2)} / month
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-700/40 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-zinc-700/40">
                <span>Total</span>
                <span className="text-lime-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl ${
              theme === "light" ? "bg-white/70" : "bg-zinc-900/70"
            } backdrop-blur-md shadow-md space-y-4`}
          >
            <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 focus:ring-2 focus:ring-lime-400 outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 focus:ring-2 focus:ring-lime-400 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 focus:ring-2 focus:ring-lime-400 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full h-12 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 focus:ring-2 focus:ring-lime-400 outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r ${PRIMARY_GRADIENT} hover:opacity-90 transition-all`}
            >
              {loading ? "Processing..." : `Upgrade to Pro – $${total.toFixed(2)}`}
            </button>

            <p className="text-xs text-zinc-400 flex items-center justify-center gap-2 mt-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Your payment info is encrypted and secure.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
