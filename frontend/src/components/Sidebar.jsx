import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";

const Sidebar = () => {
  const { user } = useUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/home", icon: "home" },
    { name: "Dashboard", path: "/dashboard", icon: "leaderboard" },
    { name: "Leaderboard", path: "/leaderboard", icon: "emoji_events" },
    { name: "Friends", path: "/friends", icon: "groups" },
    { name: "Profile", path: "/profile", icon: "settings" },
    { name: "Insights", path: "/insights", icon: "insights" },
  ];

  const filteredLinks = links.filter(link => {
    if (link.name === 'Insights') {
      return user?.subscription?.tier === 'pro';
    }
    return true;
  });

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 📱 Mobile Top Bar */}
      <div className="fixed top-[4.4rem] left-0 w-full bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border-b border-gray-300 dark:border-zinc-800 px-4 py-2 flex items-center justify-between md:hidden z-50">
        <h2 className="text-black dark:text-white font-semibold text-lg">Menu</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          <span className="material-symbols-outlined text-3xl">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* 🖥️ Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-[4.4rem] h-[calc(100vh-4.4rem)] w-50
                   bg-white dark:bg-[#18181b] border-r border-gray-300 dark:border-zinc-800
                   flex-col justify-between p-4 z-40 overflow-hidden"
      >
        {/* Navigation Section */}
        <nav className="flex flex-col gap-2">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-2 ${
                isActive(link.path)
                  ? "bg-gradient-to-r from-lime-400 to-blue-500 text-white font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="flex items-center gap-3 p-2 border-t border-gray-300 dark:border-zinc-800 mt-4">
          <img
            src={
              user?.photo && !user.photo.startsWith("http")
                ? "http://localhost:5000" + user.photo
                : user?.photo || "https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=40"
            }
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236366f1'/%3E%3Ctext x='20' y='25' font-size='14' fill='white' text-anchor='middle'%3EU%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="flex flex-col">
            <p className="font-medium text-black dark:text-white text-sm">{user?.name || "User"}</p>
            <Link to="/profile" className="text-xs text-gray-600 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white">
              View Profile
            </Link>
          </div>
        </div>
      </aside>

      {/* 📱 Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -220 }}
            animate={{ x: 0 }}
            exit={{ x: -220 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-[6.4rem] left-0 h-[calc(100vh-6.4rem)] w-52
                       bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border-r border-gray-300 dark:border-zinc-800
                       flex flex-col justify-between p-4 z-50 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg transition-colors px-3 py-2 ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-lime-400 to-blue-500 text-white font-semibold"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 p-2 border-t border-gray-300 dark:border-zinc-800 mt-4">
              <img
                src={user?.photo || "https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=40"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236366f1'/%3E%3Ctext x='20' y='25' font-size='14' fill='white' text-anchor='middle'%3EU%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="flex flex-col">
                <p className="font-medium text-black dark:text-white text-sm">{user?.name || "User"}</p>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-600 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
