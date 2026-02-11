import bcrypt from "bcrypt";
import User from "../models/users.js";
import OTP from "../models/otp.js";
import { generateOTP } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
/**
 * Initiate signup by generating OTP
 */
export const initiateSignupService = async (email) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. Remove old OTPs
  await OTP.deleteMany({ email });

  // 3. Generate OTP
  const otp = generateOTP();

  // 4. Store OTP (hashed by pre-save middleware)
  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  return {
    otp,
    expiresIn: "5 minutes"
  };
};

/**
 * Verify OTP and create user
 */
export const verifySignupOtpService = async ({
  email,
  otp,
  name,
  password,
  role,
}) => {
  // 1. Fetch OTP
  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord) {
    throw new Error("OTP expired or not found");
  }

  // 2. Check expiry
  if (otpRecord.expiresAt < Date.now()) {
    await OTP.deleteOne({ email });
    throw new Error("OTP expired");
  }

  // 3. Verify OTP
  const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);
  if (!isValidOtp) {
    throw new Error("Invalid OTP");
  }

  // 4. Create user (password hashed via pre-save middleware)
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // 5. Destroy OTP (one-time use)
  await OTP.deleteOne({ email });

  return {
    id: user._id,
    name: user.name,
    email: user.email
  };
};



export const loginService = async (email, password) => {
  const user = await User
    .findOne({ email })
    .select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};
