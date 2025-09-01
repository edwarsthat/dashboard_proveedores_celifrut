import { Router } from "express";
import { getPrecios } from "../controllers/dashboard/precios.controller.js";

const router = Router();

router.use("/precios", getPrecios);

export default router;