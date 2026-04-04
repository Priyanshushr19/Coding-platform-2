import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";
import { getLanguageById, submitBatch, submitToken } from "../utils.js/ProblemUtility.js";
import mongoose from "mongoose";

const submitCode = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !code?.trim() || !language?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID"
      });
    }

    language = language.toLowerCase();
    if (language === "cpp") language = "c++";

    const languageId = getLanguageById(language);

    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found"
      });
    }

    const hiddenTestCases = Array.isArray(problem.hiddenTestCases)
      ? problem.hiddenTestCases
      : [];

    if (hiddenTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No test cases available"
      });
    }

    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: hiddenTestCases.length
    });

    try {

      const submissionsPayload = hiddenTestCases.map(tc => ({
        source_code: code,
        language_id: languageId,
        stdin: tc?.input || "",
        expected_output: tc?.output || ""
      }));

      const judgeTimeout = 30000;

      const submitPromise = submitBatch(submissionsPayload);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Judge0 timeout")), judgeTimeout)
      );

      const submitResponse = await Promise.race([
        submitPromise,
        timeoutPromise
      ]);

      const tokens = submitResponse.map(r => r.token);

      const testResults = await submitToken(tokens);

      let passed = 0;
      let totalRuntime = 0;
      let maxMemory = 0;
      let status = "accepted";
      let errorMessage = null;

      for (const result of testResults) {

        const statusId = result?.status?.id;

        if (statusId === 3) {
          passed++;
          totalRuntime += Number(result.time ?? 0);
          maxMemory = Math.max(maxMemory, Number(result.memory ?? 0));
        } else {
          status = statusId === 4 ? "error" : "wrong";
          errorMessage =
            result.stderr ||
            result.compile_output ||
            result.message ||
            "Execution error";
        }
      }

      submission.status = status;
      submission.testCasesPassed = passed;
      submission.errorMessage = errorMessage;
      submission.runtime = totalRuntime;
      submission.memory = maxMemory;

      await submission.save();

      if (status === "accepted") {

        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { problemSolved: problemId } }
        );

      }

      return res.status(201).json({
        success: true,
        accepted: status === "accepted",
        totalTestCases: submission.testCasesTotal,
        passedTestCases: passed,
        runtime: totalRuntime.toFixed(3),
        memory: maxMemory,
        message: status,
        errorMessage,
        submissionId: submission._id
      });

    } catch (judgeError) {

      submission.status = "error";
      submission.errorMessage = judgeError.message;

      await submission.save();

      console.error("Judge0 Error:", judgeError);

      if (judgeError.message.includes("timeout")) {
        return res.status(504).json({
          success: false,
          message: "Code execution timed out"
        });
      }

      return res.status(502).json({
        success: false,
        message: "Code execution service unavailable"
      });

    }

  } catch (err) {

    console.error("Submit Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development"
        ? err.message
        : undefined
    });

  }
};


const runCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    // Validation
    if (!userId || !code?.trim() || !problemId || !language?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid problem ID" 
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        success: false,
        message: "Problem not found" 
      });
    }

    // Normalize language
    language = language.toLowerCase();
    if (language === 'cpp') language = 'c++';

    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).json({ 
        success: false,
        message: `Unsupported language: ${language}` 
      });
    }

    // Get visible test cases
    const visibleTestCases = Array.isArray(problem.visibleTestCases) 
      ? problem.visibleTestCases 
      : [];

    if (visibleTestCases.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No test cases available" 
      });
    }

    // Prepare Judge0 payload
    const submissionsPayload = visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase?.input || "",
      expected_output: testcase?.output || ""
    }));

    // Send to Judge0 with timeout
    const judgeTimeout = 20000; // 20 seconds for run
    const submitPromise = submitBatch(submissionsPayload);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Judge0 timeout')), judgeTimeout)
    );

    const submitResult = await Promise.race([submitPromise, timeoutPromise]);
    
    if (!submitResult || !Array.isArray(submitResult)) {
      return res.status(502).json({
        success: false,
        message: "Code execution service unavailable"
      });
    }

    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    if (!testResult || !Array.isArray(testResult)) {
      return res.status(502).json({
        success: false,
        message: "Failed to get execution results"
      });
    }

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      const statusId = test?.status?.id || test?.status_id;
      if (statusId === 3) { // Accepted
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, Number(test.memory || 0));
      } else {
        status = false;
        errorMessage = test.stderr || test.compile_output || test.message || "Execution error";
        break; // Stop on first failure for run
      }
    }

    return res.status(200).json({
      success: status,
      testCases: testResult,
      passed: testCasesPassed,
      total: visibleTestCases.length,
      runtime: runtime.toFixed(3),
      memory,
      errorMessage
    });

  } catch (err) {
    console.error("Run Code Error:", err);
    
    if (err.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: "Code execution timed out"
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export { submitCode, runCode }