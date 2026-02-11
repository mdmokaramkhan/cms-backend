import express from "express";
import {
  initiateSignup,
  verifySignupOtp,
  login
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * SIGNUP FLOW
 */

// Step 1: Initiate signup (generate OTP)
router.post("/signup/initiate", initiateSignup);

// Step 2: Verify OTP and create user
router.post("/signup/verify", verifySignupOtp);
router.post("/login", login);

export default router;
