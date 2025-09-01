import { Router } from "express";
import { getLoggerUsers } from "../controllers/admin/users.controller.js";

const router = Router();

router.use("/logged-users", getLoggerUsers);

export default router;