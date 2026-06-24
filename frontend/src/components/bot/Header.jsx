import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import config from "../../config";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { authUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${config.API_URL}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    navigate("/login");
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between backdrop-blur-md bg-white/10 border-b border-white/20 px-3 sm:px-4 py-3 sm:py-4">
      <button
        className="md:hidden text-lg sm:text-xl text-white p-1"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FaBars />
      </button>

      <h1 className="font-semibold text-sm sm:text-base text-white">
        🚀 Interview Prep Bot
      </h1>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm text-gray-400 hidden sm:block truncate max-w-24">
          {authUser?.username}
        </span>
        <FaUserCircle className="text-xl sm:text-2xl text-white hidden sm:block" />
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 sm:px-3 py-1 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;