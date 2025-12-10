import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useUser();

  return (
    <header className="flex items-center justify-between px-6 py-4 fixed top-0 w-full z-50 bg-white dark:bg-[#18181b] backdrop-blur-sm shadow-md">
      {/* Logo */}
      <Link to="/">
        <div className="flex items-center gap-3 text-black dark:text-white">
          <svg
            fill="none"
            height="32"
            viewBox="0 0 48 48"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="text-lime-400"
              clipRule="evenodd"
              d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM21.5 17.5V12H26.5V17.5H21.5ZM12 21.5H17.5V26.5H12V21.5ZM30.5 21.5H36V26.5H30.5V21.5ZM21.5 30.5V36H26.5V30.5H21.5Z"
              fill="currentColor"
              fillRule="evenodd"
            />
            <path
              d="M24 21.5C24 20.1193 25.1193 19 26.5 19H30.5V12H26.5C22.9101 12 20 14.9101 20 18.5V20H18.5C14.9101 20 12 22.9101 12 26.5H19V30.5H12V26.5C12 22.9101 14.9101 20 18.5 20H20V18.5C20 16.0147 21.0147 15 23.5 15C25.9853 15 26.5 16.0147 26.5 18.5V20H28C31.5899 20 34.5 22.9101 34.5 26.5H36C36 22.9101 33.0899 20 29.5 20H28V21.5H24ZM24 28H21.5V36H26.5C30.0899 36 33 33.0899 33 29.5V28H24Z"
              fill="url(#paint0_linear_1_2)"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_1_2"
                x1="12"
                x2="36"
                y1="12"
                y2="36"
              >
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-xl font-bold">CodeStreak</h2>
        </div>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {user?.subscription?.tier === 'pro' ? (
          <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent font-semibold">
            Pro User
          </span>
        ) : (
          <Link
            to="/fake-payment"
            className="bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent font-semibold hover:opacity-80 transition"
          >
            Join Pro
          </Link>
        )}
        <button
          onClick={signOut}
          className="h-10 px-6 rounded-lg font-semibold text-white
                     bg-gradient-to-r from-[#468DE0] via-[#72B78F] to-[#9DE03F]
                     hover:opacity-90 transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
