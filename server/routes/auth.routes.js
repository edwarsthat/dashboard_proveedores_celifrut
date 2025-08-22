import { Router } from "express";
import { googleAuth } from "../controllers/auth.controller.js";

const router = Router();

// Todas las rutas de auth
router.use("/google", googleAuth);

export default router;