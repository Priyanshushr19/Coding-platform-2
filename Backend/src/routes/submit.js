import express from "express"
import userMiddleware from "../middleware/userMiddleware.js"
import { runCode, submitCode } from "../controllers/userSubmmission.js"
import { submitLimiter, runLimiter } from "../middleware/rateLimiter.js";

const submitRouter=express.Router()

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode)
submitRouter.post("/run/:id", userMiddleware, runLimiter, runCode)

export default submitRouter