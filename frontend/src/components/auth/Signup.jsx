import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import config from "../../config";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");   //  separate email error
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };


  // Gmail validation function
  const validateGmail = (email) => {
    const trimmed = email.toLowerCase().trim();

    if (!trimmed) return "";

    // Must end with @gmail.com
    if (trimmed.includes("@") && !trimmed.endsWith("@gmail.com")) {
      return "Only Gmail addresses allowed (@gmail.com)";
    }

    const localPart = trimmed.split("@")[0];

    if (!localPart) return "";

    // Must start with a letter
    if (/^[0-9]/.test(localPart)) {
      return "❌ Email must not start with a number";
    }
    if (/^\./.test(localPart)) {
      return "❌ Email must not start with a dot";
    }
    if (/^[^a-zA-Z]/.test(localPart)) {
      return "❌ Email must start with a letter";
    }

    // Min 6 characters
    if (localPart.length < 6) {
      return "❌ Gmail username must be at least 6 characters";
    }

    // Max 30 characters
    if (localPart.length > 30) {
      return "❌ Gmail username cannot exceed 30 characters";
    }

    // Cannot end with dot
    if (localPart.endsWith(".")) {
      return "❌ Email must not end with a dot";
    }

    // Cannot have consecutive dots
    if (localPart.includes("..")) {
      return "❌ Email cannot have consecutive dots";
    }

    // Only letters, numbers, dots allowed
    if (!/^[a-zA-Z0-9.]+$/.test(localPart)) {
      return "❌ Email can only contain letters, numbers, and dots";
    }

    // Full email must end with @gmail.com
    if (trimmed.includes("@") && !trimmed.endsWith("@gmail.com")) {
      return "❌ Only @gmail.com addresses allowed";
    }

    return "";   // valid
  };


  //  Handle email change with live validation
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    const err = validateGmail(val);
    setEmailError(err);
  };

  const handleSendOtp = async () => {
    setError("");

    if (!form.username || !form.email || !form.password) {
      return setError("All fields are required");
    }

    if (form.username.length < 3) {
      return setError("Username must be at least 3 characters");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    // Check email validation before sending OTP
    const emailErr = validateGmail(form.email);
    if (emailErr) {
      return setEmailError(emailErr);
    }

    //  Must be complete gmail.com address
    if (!form.email.toLowerCase().endsWith("@gmail.com")) {
      return setEmailError("❌ Only Gmail addresses allowed (@gmail.com)");
    }

    setLoading(true);
    try {
      await axios.post(`${config.API_URL}/auth/send-otp`, {
        email: form.email.toLowerCase().trim()
      });
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await axios.post(`${config.API_URL}/auth/send-otp`, {
        email: form.email.toLowerCase().trim()
      });
      startTimer();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) return setError("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}/auth/signup`, {
        ...form,
        email: form.email.toLowerCase().trim(),
        otp
      });
      login(res.data.user, res.data.token);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8">

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-2xl">
            {step === 1 ? "🚀" : "📧"}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">
          {step === 1 ? "Create Account 🚀" : "Verify Email 📧"}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm text-center mb-4">
          {step === 1 ? "Join SDE Interview Prep Bot" : `OTP sent to ${form.email}`}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? "bg-green-400" : "bg-white/20"}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? "bg-green-400" : "bg-white/20"}`} />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 text-xs sm:text-sm px-4 py-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username (min 3 characters)"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-green-400 transition"
            />

            {/* ✅ Email input with live validation */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Gmail only (e.g. john123@gmail.com)"
                value={form.email}
                onChange={handleEmailChange} // ✅ live validation
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition
                  ${emailError
                    ? "border-red-500/70 focus:border-red-500"
                    : form.email && !emailError
                    ? "border-green-400/70 focus:border-green-400"
                    : "border-white/10 focus:border-green-400"
                  }`}
              />
              {/* ✅ Live email error shown below input */}
              {emailError && (
                <p className="text-red-400 text-xs px-1">{emailError}</p>
              )}
              {/* ✅ Show green tick when valid */}
              {form.email && !emailError && form.email.endsWith("@gmail.com") && (
                <p className="text-green-400 text-xs px-1">✅ Valid Gmail address</p>
              )}
              {/* ✅ Hint text */}
              {!emailError && !form.email && (
                <p className="text-gray-500 text-xs px-1">
                  Must start with a letter • Only @gmail.com • No special symbols
                </p>
              )}
            </div>

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-green-400 transition"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading || !!emailError}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition active:scale-95"
            >
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-green-400 transition text-center tracking-widest text-lg font-bold"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition active:scale-95"
            >
              {loading ? "Verifying..." : "Verify & Create Account ✓"}
            </button>

            <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
              <button
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
                className="text-gray-400 hover:text-white transition"
              >
                ← Change email
              </button>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-green-400 hover:underline disabled:text-gray-500 transition"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-xs sm:text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;