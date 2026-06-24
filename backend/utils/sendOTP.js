import nodemailer from "nodemailer";


export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `" SDE Prep Bot 🤖" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your OTP for SDE Prep Bot",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#0f0f0f;color:white;border-radius:12px;">
        <h2 style="color:#4ade80;text-align:center;">🤖 SDE Prep Bot</h2>
        <p style="text-align:center;color:#aaa;">Your One-Time Password</p>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
          <h1 style="color:#4ade80;font-size:40px;letter-spacing:10px;margin:0;">
            ${otp}
          </h1>
        </div>
        <p style="color:#aaa;text-align:center;font-size:14px;">
          This OTP expires in <strong style="color:white;">5 minutes</strong>.
          Do not share it with anyone.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ OTP sent successfully to:", email)
};