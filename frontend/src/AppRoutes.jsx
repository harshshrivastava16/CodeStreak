import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Direct static imports instead of lazy + Suspense
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import HelpCenter from "./pages/HelpCenter";
import Checkout from "./pages/Checkout";
import Insights from "./pages/Insights";
import Compare from "./pages/Compare";
import History from "./pages/History";
import SetupStep1 from "./pages/SetupStep1";
import SetupStep2 from "./pages/SetupStep2";
import SetupStep3 from "./pages/SetupStep3";
import FakePayment from "./pages/FakePayment";

const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact-us" element={<ContactUs />} />

      {/* Protected Routes */}
      {user && (
        <>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/setup/step1" element={<SetupStep1 />} />
          <Route path="/setup/step2" element={<SetupStep2 />} />
          <Route path="/setup/step3" element={<SetupStep3 />} />
          <Route path="/fake-payment" element={<FakePayment />} />
        </>
      )}

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to={user ? (user.onboarded ? "/home" : "/setup/step1") : "/"} />} />
    </Routes>
  );
};

export default AppRoutes;
