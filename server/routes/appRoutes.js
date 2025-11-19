import express from "express";
import { generateQuote, generatePlan, deletePlan, getUserPlans, getPlanById, generateImage } from "../controllers/fitnessPlan.js";
import { authenticate,optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// App routes - use optionalAuth to allow both authenticated and guest users
router.get("/generateQuote", optionalAuth, generateQuote);
router.post("/generatePlan", optionalAuth, generatePlan);
router.get("/plans", authenticate, getUserPlans);
router.get("/plans/:planId", authenticate, getPlanById);
router.delete("/plans/:planId", authenticate, deletePlan);
router.post("/generateImage", optionalAuth, generateImage);

export default router;
