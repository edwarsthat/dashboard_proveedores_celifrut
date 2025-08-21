import { Router } from "express";
import { home } from "../controllers/home.controllers.js";
const router = Router();

router.get("/", home);

export default router;