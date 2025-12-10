import { Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        flex items-center justify-between
        px-6 sm:px-10 py-4
        bg-[#0A0A0C]/60 backdrop-blur-xl
        border-b border-white/10
      "
    >
      {/* LOGO */}
      <Link
        to="/"
        className="flex items-center gap-3 group cursor-pointer"
      >
        <div className="relative w-9 h-9 flex items-center justify-center">
          {/* Glow */}
          <div className="
            absolute inset-0 rounded-full 
            bg-gradient-to-br from-lime-400/40 via-blue-400/40 to-purple-500/40 
            blur-xl opacity-0 group-hover:opacity-100 transition-opacity
          "></div>

          <svg
            height="32"
            width="32"
            fill="none"
            viewBox="0 0 48 48"
            className="relative drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          >
            <path
              className="text-lime-400"
              d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM21.5 17.5V12H26.5V17.5H21.5ZM12 21.5H17.5V26.5H12V21.5ZM30.5 21.5H36V26.5H30.5V21.5ZM21.5 30.5V36H26.5V30.5H21.5Z"
              fill="currentColor"
            />
            <path
              d="M24 21.5C24 20.1193 25.1193 19 26.5 19H30.5V12H26.5C22.9101 12 20 14.9101 20 18.5V20H18.5C14.9101 20 12 22.9101 12 26.5H19V30.5H12V26.5C12 22.9101 14.9101 20 18.5 20H20V18.5C20 16.0147 21.0147 15 23.5 15C25.9853 15 26.5 16.0147 26.5 18.5V20H28C31.5899 20 34.5 22.9101 34.5 26.5H36C36 22.9101 33.0899 20 29.5 20H28V21.5H24ZM24 28H21.5V36H26.5C30.0899 36 33 33.0899 33 29.5V28H24Z"
              fill="url(#linear_logo)"
            />
            <defs>
              <linearGradient id="linear_logo" x1="12" y1="12" x2="36" y2="36">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight group-hover:opacity-90 transition-opacity">
          CodeStreak
        </h2>
      </Link>

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
        <NavItem to="/features" label="Features" />
        <NavItem to="/pricing" label="Pricing" />
        <NavItem to="/contact-us" label="Contact Us" />
      </nav>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-white hover:opacity-80 transition-opacity"
      >
        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* MOBILE SLIDE-IN PANEL */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* PANEL */}
            <motion.div
              className="
                fixed right-0 top-0 h-full w-72 
                bg-[#111113]/90 backdrop-blur-xl 
                border-l border-white/10 
                z-50 px-6 py-8 flex flex-col
              "
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setOpen(false)}
                className="mb-10 self-end text-white hover:opacity-80 transition-opacity"
              >
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>

              <div className="flex flex-col gap-6 text-lg font-medium">
                <MobileNavItem to="/features" label="Features" close={setOpen} />
                <MobileNavItem to="/pricing" label="Pricing" close={setOpen} />
                <MobileNavItem to="/contact-us" label="Contact Us" close={setOpen} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

/* DESKTOP NAV ITEM */
const NavItem = ({ label, to }) => (
  <Link
    to={to}
    className="relative text-zinc-300 hover:text-white transition-colors pb-1"
  >
    {label}
    <span
      className="
        absolute left-0 -bottom-1 
        w-0 h-[2px] rounded-full
        bg-gradient-to-r from-lime-400 via-blue-400 to-purple-400
        transition-all duration-300 
        hover:w-full
      "
    ></span>
  </Link>
);

/* MOBILE MENU NAV ITEM */
const MobileNavItem = ({ label, to, close }) => (
  <Link
    to={to}
    onClick={() => close(false)}
    className="text-zinc-300 hover:text-white transition-colors"
  >
    {label}
  </Link>
);

export default PublicNavbar;
