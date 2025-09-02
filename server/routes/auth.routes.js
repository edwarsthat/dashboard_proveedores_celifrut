import { Router } from "express";
import { authMe, googleAuth, googleCallback, logout, microsoftAuth, microsoftCallback } from "../controllers/auth.controller.js";

const router = Router();

// Todas las rutas de auth
router.get("/me", authMe);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/microsoft", microsoftAuth);
router.get("/microsoft/callback", microsoftCallback);
router.post("/logout", logout);

export default router;