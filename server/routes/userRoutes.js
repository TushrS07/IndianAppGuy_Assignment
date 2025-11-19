import express from "express";
import {
  signUp,
  signIn,
  verifyOtp,
  resendOtp,
  getProfile,
  saveProfile,
  logout,
} from "../controllers/appController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Authentication routes (public)
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/logout", logout);

// Profile routes (protected - require authentication)
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, saveProfile);

export default router;
