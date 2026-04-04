import express from "express";
import { getProblemsApi, getProblemByIdApi } from "../controllers/apiProblemController.js";
// import { getProblemsApi, getProblemByIdApi } from "../controllers/apiProblems.js";

const router = express.Router();

router.get("/", getProblemsApi);
router.get("/:id", getProblemByIdApi);

export default router;