import Problem from "../models/problem.js";
import SolutionVideo from "../models/solutionVideo.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import { getLanguageById, submitBatch, submitToken } from "../utils.js/ProblemUtility.js"; // Make sure path is correct
import { invalidateProblemCache } from "../services/problemService.js";

// -------------------------- Create Problem --------------------------
const createProblem = async (req, res) => {
    const {
        title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode,
        referenceSolution
    } = req.body;

    try {
        if (!Array.isArray(referenceSolution)) {
            return res.status(400).send("referenceSolution missing or invalid");
        }

        if (!Array.isArray(visibleTestCases)) {
            return res.status(400).send("visibleTestCases missing or invalid");
        }

        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);
            if (!languageId) {
                return res.status(400).send(`Invalid language: ${language}`);
            }

            // Build submissions
            const submissions = visibleTestCases.map(testcase => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            console.log("Submissions Payload -->", submissions);

            // Call Judge0
            const submitResult = await submitBatch(submissions);
            console.log("Batch Response -->", submitResult);

            // ✔ Correct validation (because response is an array)
            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(400).send("submitBatch returned invalid result");
            }

            const tokens = submitResult.map(obj => obj.token);

            const testResult = await submitToken(tokens);

            // Validate token response
            if (!Array.isArray(testResult)) {
                return res.status(400).send("submitToken returned invalid result");
            }

            // Validate all passed
            for (const result of testResult) {
                if (result.status?.id !== 3) {
                    return res.status(400).send(`Reference solution failed: ${result.status?.description}`);
                }
            }
        }

        // Save to database
        const created = await Problem.create({
            ...req.body,
            problemCreator: req.user._id
        });

        // Invalidate caches now that a new problem exists
        await invalidateProblemCache(created._id.toString());

        return res.status(201).send("Problem Saved Successfully");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error: " + err.message);
    }
};


// -------------------------- Update Problem --------------------------
const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode,
        referenceSolution
    } = req.body;

    try {
        if (!id) return res.status(400).send("Missing ID Field");

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) return res.status(404).send("Problem not found");

        // Validate reference solution
        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Reference solution failed testcases");
                }
            }
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        // Invalidate caches for this problem and the list
        await invalidateProblemCache(id);

        return res.status(200).send(updatedProblem);

    } catch (err) {
        return res.status(500).send("Error: " + err);
    }
};



// -------------------------- Delete Problem --------------------------
const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send("ID is Missing");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem)
            return res.status(404).send("Problem not found");

        // Invalidate caches for this problem and the list
        await invalidateProblemCache(id);

        return res.status(200).send("Successfully Deleted");

    } catch (error) {
        return res.status(500).send("Error: " + error);
    }
};



// -------------------------- Get Problem by ID --------------------------



//    const videos = await SolutionVideo.findOne({problemId:id});

//    if(videos){   

//    const responseData = {
//     ...getProblem.toObject(),
//     secureUrl:videos.secureUrl,
//     thumbnailUrl : videos.thumbnailUrl,
//     duration : videos.duration,
//    } 

//    return res.status(200).send(responseData);
//    }

//    res.status(200).send(getProblem);

//   }
//   catch(err){
//     res.status(500).send("Error: "+err);
//   }
// }
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Problem ID is required"
            });
        }

        const problem = await Problem.findById(id).select(
            "_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution"
        );

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const videos = await SolutionVideo.findOne({ problemId: id });

        // ✅ If video exists, send enhanced response
        if (videos) {
            return res.status(200).json({
                ...problem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration,
            });
        }

        // ✅ Single clean response
        return res.status(200).json(problem);

    } catch (error) {
        console.error("getProblemById Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};



// -------------------------- Get All Problems --------------------------
const getAllProblem = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const difficulty = req.query.difficulty;
        const tag = req.query.tag;
        const search = req.query.search;

        // Build query
        const query = {};
        if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
            query.difficulty = difficulty;
        }
        if (tag && ['math', 'array', 'linkedList', 'graph', 'dp'].includes(tag)) {
            query.tags = tag;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [problems, total] = await Promise.all([
            Problem.find(query)
                .select("_id title difficulty tags")
                .skip(skip)
                .limit(limit)
                .lean(),
            Problem.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            problems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("getAllProblem Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



// ------------------- Get All Solved Problems by User -------------------
const solvedAllProblembyUser = async (req, res) => {

    try {

        const userr = req.user;
        const userId = userr._id;
        console.log(userId);
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        });
        // const user = await User.findById(userId).populate("problemSolved");
        // console.log(user);
        if (!user)
            return res.status(404).send("User not found");

        return res.status(200).send(user.problemSolved);

    } catch (error) {
        return res.status(500).send("Server Error");
    }
};



// -------------------------- Get All Submissions for a Problem --------------------------
const submittedProblem = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.pid;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Validate problemId
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        const [submissions, total] = await Promise.all([
            Submission.find({ userId, problemId })
                .select("-code") // Exclude code for list view to reduce payload
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Submission.countDocuments({ userId, problemId })
        ]);

        return res.status(200).json({
            success: true,
            submissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("submittedProblem Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export {
    createProblem,
    updateProblem,
    deleteProblem,
    getAllProblem,
    getProblemById,
    solvedAllProblembyUser,
    submittedProblem
};
