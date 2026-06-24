import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("All fields are required");
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form);

      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">

        {/* Logo / Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-2xl">
            🤖
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">
          Welcome Back 👋
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm text-center mb-6">
          Login to SDE Interview Prep Bot
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 text-xs sm:text-sm px-4 py-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 outline-none focus:border-green-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 outline-none focus:border-green-400 transition"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm sm:text-base hover:opacity-90 disabled:opacity-50 transition active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;





