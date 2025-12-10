import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const Login = () => {
  const { signInWithGoogle, user, setUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/users/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      const user = response.data.user;
      if (user.onboarded) {
        navigate("/dashboard");
      } else {
        navigate("/setup/step1");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#18181b] flex flex-col">
      {/* 🔥 Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-lime-400/10 via-blue-400/10 to-purple-500/10 blur-3xl animate-pulse" />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {/* Glassmorphic Card */}
        <div className="bg-[#1f1f24]/80 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl p-10 max-w-md w-full transform transition duration-500 hover:scale-[1.02]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-text">
              Welcome to CodeStreak
            </h1>
            <p className="text-gray-300">
              Track your LeetCode streaks, compete with friends, and never miss a
              POTD again.
            </p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="mb-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-400 text-sm text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex justify-center py-3 px-4 rounded-lg text-black font-bold 
              bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 shadow-lg
              hover:scale-105 hover:shadow-xl transition-all duration-300
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#1f1f24] text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-gray-600 bg-gray-700/70 text-white font-semibold hover:bg-gradient-to-r hover:from-lime-400 hover:via-blue-400 hover:to-purple-500 hover:text-black hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-lime-400 hover:text-lime-300 transition"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
