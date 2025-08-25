import { Router } from "express";
import { authMe, googleAuth, googleCallback } from "../controllers/auth.controller.js";

const router = Router();

// Todas las rutas de auth
router.get("/me", authMe);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;