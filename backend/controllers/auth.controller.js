import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTPEmail } from "../utils/sendOTP.js";

// ─── Email Validation ───
const validateEmail = (email) => {
  if (!email) return { valid: false, reason: "Email is required" };

  const trimmed = email.toLowerCase().trim();

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: "Invalid email format" };
  }

  const [localPart, domain] = trimmed.split("@");

  // Gmail only
  if (domain !== "gmail.com") {
    return { valid: false, reason: "Only Gmail addresses are allowed (@gmail.com)" };
  }

  // Must start with a letter
  if (/^[0-9]/.test(localPart)) {
    return { valid: false, reason: "Email must not start with a number" };
  }
  if (/^\./.test(localPart)) {
    return { valid: false, reason: "Email must not start with a dot" };
  }
  if (/^[^a-zA-Z]/.test(localPart)) {
    return { valid: false, reason: "Email must start with a letter" };
  }

  //  Min 6, max 30 characters
  if (localPart.length < 6) {
    return { valid: false, reason: "Gmail username must be at least 6 characters" };
  }
  if (localPart.length > 30) {
    return { valid: false, reason: "Gmail username cannot exceed 30 characters" };
  }

  //  Cannot end with dot
  if (localPart.endsWith(".")) {
    return { valid: false, reason: "Email must not end with a dot" };
  }

  //  Cannot have consecutive dots
  if (localPart.includes("..")) {
    return { valid: false, reason: "Email cannot have consecutive dots" };
  }

  //  Only letters, numbers, dots allowed
  if (!/^[a-zA-Z0-9.]+$/.test(localPart)) {
    return { valid: false, reason: "Email can only contain letters, numbers, and dots" };
  }

  return { valid: true };
};

// ─── Generate JWT Token ───
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── Send OTP ───
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    //  Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    // Check if already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered. Please login." });
    }

    // Delete existing OTPs for this email
    await OTP.deleteMany({ email });

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email!",
    });

  } catch (error) {
    console.error("sendOtp error:", error.message);
    return res.status(500).json({ error: "Failed to send OTP. Check your email." });
  }
};

// ─── Verify OTP + Signup ───
export const signup = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    //  Validate email again on signup (double safety)
    const validation = validateEmail(email);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // Delete OTP after verification
    await OTP.deleteMany({ email });

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Login ───
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Logout ───
export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};