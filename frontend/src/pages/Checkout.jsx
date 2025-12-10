import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;
    const start = async () => {
      try {
        setLoading(true);
        const res = await axios.post("/subscription/checkout/start", {
          userId: user._id,
          plan: "pro",
        });
        setPaymentId(res.data.paymentId);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to start checkout");
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [user?._id]);

  const confirmPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const res = await axios.post("/subscription/checkout/confirm", {
        userId: user._id,
        paymentId,
        fakeCardNumber: cardNumber,
      });

      // Update local user subscription in context
      const updatedUser = { ...user, subscription: res.data.subscription };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Pro activated! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (e) {
      setError(e?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-white p-6">Please log in first.</div>;

  return (
    <div className="min-h-screen bg-[#18181b] text-white px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-6">Upgrade to Pro</h1>
      <p className="text-gray-300 mb-8">Unlock unlimited friends, advanced stats, custom alerts, and AI insights.</p>

      {error && <div className="bg-red-600/20 border border-red-600 text-red-300 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-600/20 border border-green-600 text-green-300 p-3 rounded mb-4">{success}</div>}

      <form onSubmit={confirmPayment} className="space-y-4 bg-[#1f1f24] p-6 rounded-xl border border-white/10">
        <div>
          <label className="block text-sm mb-1">Name on Card</label>
          <input value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full p-3 rounded bg-[#2a2a31] border border-white/10" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm mb-1">Card Number (enter any, 0000 causes failure)</label>
          <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full p-3 rounded bg-[#2a2a31] border border-white/10" placeholder="4242 4242 4242 4242" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Expiry</label>
            <input value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full p-3 rounded bg-[#2a2a31] border border-white/10" placeholder="MM/YY" />
          </div>
          <div>
            <label className="block text-sm mb-1">CVV</label>
            <input value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full p-3 rounded bg-[#2a2a31] border border-white/10" placeholder="123" />
          </div>
        </div>
        <button disabled={loading || !paymentId} className="w-full py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black disabled:opacity-50">
          {loading ? "Processing..." : "Activate Pro"}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-400">This is a fake checkout for development. We'll replace it with Stripe later.</div>
    </div>
  );
};

export default Checkout; 