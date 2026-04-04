import express from "express";
import userMiddleware from "../middleware/userMiddleware.js";
import { runCustomTestCase } from "../controllers/customRunController.js";

const router = express.Router();

// Custom test case execution for a problem (no DB write).
router.post("/custom-run", userMiddleware, runCustomTestCase);

export default router;

