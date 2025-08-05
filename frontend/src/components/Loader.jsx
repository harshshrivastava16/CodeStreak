import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { useState } from "react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/friends", label: "Friends" },
];

const Navbar = () => {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#18181b] bg-opacity-95 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">CodeStreak</Link>
        {user && (
          <>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-lg font-semibold px-3 py-1 rounded transition duration-150 ${location.pathname === link.to ? "bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black shadow" : "text-gray-300 hover:text-lime-400"}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="relative ml-4">
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.photoURL || user.photo || "/vite.svg"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border-2 border-lime-400 object-cover"
                  />
                  <span className="text-white font-semibold hidden lg:block">{user.displayName?.split(" ")[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-900 rounded-xl shadow-lg py-2 border border-gray-700 animate-fade-in">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800"
                    >Logout</button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex items-center text-gray-300 focus:outline-none"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Open menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile Menu */}
            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-end md:hidden">
                <div className="w-64 bg-[#18181b] h-full shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
                  <button className="self-end mb-4" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-lg font-semibold px-3 py-2 rounded transition duration-150 ${location.pathname === link.to ? "bg-gradient-to-r from-lime-400 via-blue-400 to-purple-500 text-black shadow" : "text-gray-300 hover:text-lime-400"}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-8 flex items-center gap-3">
                    <img
                      src={user.photoURL || user.photo || "/vite.svg"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-lime-400 object-cover"
                    />
                    <span className="text-white font-semibold">{user.displayName?.split(" ")[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-lime-400 text-black font-bold shadow hover:scale-105 transition"
                  >Logout</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
