import mongoose from "mongoose";
import Problem from "../models/problem.js";
import { runCustomCode } from "../services/judge0Service.js";

// POST /api/submission/custom-run
// Runs user code against Judge0 with custom stdin without persisting anything.
export const runCustomTestCase = async (req, res, next) => {
  try {
    const { problemId, language_id, source_code, stdin } = req.body || {};

    if (!problemId || !language_id || !source_code) {
      return res.status(400).json({
        message: "problemId, language_id and source_code are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        message: "Invalid problemId",
      });
    }

    const problem = await Problem.findById(problemId).select("_id");
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    const result = await runCustomCode({
      language_id,
      source_code,
      stdin,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("runCustomTestCase Error:", error);
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

