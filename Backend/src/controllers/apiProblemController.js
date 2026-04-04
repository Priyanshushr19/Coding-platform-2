import mongoose from "mongoose";
import {
  getProblemsWithCache,
  getProblemByIdWithCache,
} from "../services/problemService.js";

// GET /api/problems
export const getProblemsApi = async (req, res) => {
  try {
    const data = await getProblemsWithCache(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error("getProblemsApi Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET /api/problems/:id
export const getProblemByIdApi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    const problem = await getProblemByIdWithCache(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json(problem);
  } catch (error) {
    console.error("getProblemByIdApi Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

