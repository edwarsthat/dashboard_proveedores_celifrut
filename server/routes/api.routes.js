import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from './dashboard.route.js'
import { requireAuth } from "../controllers/auth.controller.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);

export default router;