import { Router } from "express";
import { home } from "../controllers/home.controllers.js";
import apiRoutes from "./api.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/", home);
router.use("/api", apiRoutes);
router.use("/admin", adminRoutes);

export default router;