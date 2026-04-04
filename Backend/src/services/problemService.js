import Problem from "../models/problem.js";
import SolutionVideo from "../models/solutionVideo.js";
import {redisClient} from "../config/redis.js"; // <-- fix path if needed

const PROBLEMS_LIST_KEY = "problems:all";
const PROBLEMS_LIST_TTL_SECONDS = 5 * 60; // 5 minutes
const PROBLEM_TTL_SECONDS = 10 * 60; // 10 minutes

// ---------------- GET ALL PROBLEMS ----------------

export const getProblemsWithCache = async (queryParams) => {

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;

  const difficulty = queryParams.difficulty;
  const tag = queryParams.tag;
  const search = queryParams.search;

  const query = {};

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    query.difficulty = difficulty;
  }

  if (tag && ["math", "array", "linkedList", "graph", "dp"].includes(tag)) {
    query.tags = tag;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const isDefaultList =
    page === 1 &&
    limit === 20 &&
    !difficulty &&
    !tag &&
    !search;

  // ---- Redis GET ----
  if (isDefaultList && redisClient?.isOpen) {
    try {

      const cached = await redisClient.get(PROBLEMS_LIST_KEY);

      if (cached) {
        return JSON.parse(cached);
      }

    } catch (err) {
      console.error("Redis GET problems list error:", err.message);
    }
  }

  // ---- DB QUERY ----
  const [problems, total] = await Promise.all([
    Problem.find(query)
      .select("_id title difficulty tags")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Problem.countDocuments(query)
  ]);

  const payload = {
    success: true,
    problems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  // ---- Redis SET ----
  if (isDefaultList && redisClient?.isOpen) {
    try {

      await redisClient.setEx(
        PROBLEMS_LIST_KEY,
        PROBLEMS_LIST_TTL_SECONDS,
        JSON.stringify(payload)
      );

    } catch (err) {
      console.error("Redis SET problems list error:", err.message);
    }
  }

  return payload;
};



// ---------------- GET PROBLEM BY ID ----------------

export const getProblemByIdWithCache = async (id) => {

  const key = `problem:${id}`;

  // ---- Redis GET ----
  if (redisClient?.isOpen) {
    try {

      const cached = await redisClient.get(key);

      if (cached) {
        return JSON.parse(cached);
      }

    } catch (err) {
      console.error("Redis GET problem error:", err.message);
    }
  }

  // ---- Parallel DB queries (faster) ----
  const [problem, videos] = await Promise.all([
    Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution"
    ).lean(),

    SolutionVideo.findOne({ problemId: id }).lean()
  ]);

  if (!problem) {
    return null;
  }

  let payload;

  if (videos) {

    payload = {
      ...problem,
      secureUrl: videos.secureUrl,
      thumbnailUrl: videos.thumbnailUrl,
      duration: videos.duration
    };

  } else {

    payload = problem;

  }

  // ---- Redis SET ----
  if (redisClient?.isOpen) {
    try {

      await redisClient.setEx(
        key,
        PROBLEM_TTL_SECONDS,
        JSON.stringify(payload)
      );

    } catch (err) {
      console.error("Redis SET problem error:", err.message);
    }
  }

  return payload;
};



// ---------------- INVALIDATE CACHE ----------------

export const invalidateProblemCache = async (problemId) => {

  if (!redisClient?.isOpen) return;

  try {

    const keys = [PROBLEMS_LIST_KEY];

    if (problemId) {
      keys.push(`problem:${problemId}`);
    }

    // delete known keys
    await redisClient.del(keys);

    // also clear filtered list caches
    const patternKeys = await redisClient.keys("problems:*");

    if (patternKeys.length) {
      await redisClient.del(patternKeys);
    }

  } catch (err) {
    console.error("Redis invalidate cache error:", err.message);
  }
};

// import Problem from "../models/problem.js";
// import SolutionVideo from "../models/solutionVideo.js";
// import redisClient from "../utils/redisClient.js";

// const PROBLEMS_LIST_KEY = "problems:all";
// const PROBLEMS_LIST_TTL_SECONDS = 5 * 60; // 5 minutes
// const PROBLEM_TTL_SECONDS = 10 * 60; // 10 minutes

// // Fetch paginated problems with optional caching for the default listing.
// export const getProblemsWithCache = async (queryParams) => {
//   const page = parseInt(queryParams.page, 10) || 1;
//   const limit = parseInt(queryParams.limit, 10) || 20;
//   const difficulty = queryParams.difficulty;
//   const tag = queryParams.tag;
//   const search = queryParams.search;

//   const query = {};
//   if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
//     query.difficulty = difficulty;
//   }
//   if (tag && ["math", "array", "linkedList", "graph", "dp"].includes(tag)) {
//     query.tags = tag;
//   }
//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//     ];
//   }

//   const isDefaultList =
//     page === 1 &&
//     limit === 20 &&
//     !difficulty &&
//     !tag &&
//     !search;

//   if (isDefaultList && redisClient?.isOpen) {
//     try {
//       const cached = await redisClient.get(PROBLEMS_LIST_KEY);
//       if (cached) {
//         return JSON.parse(cached);
//       }
//     } catch (err) {
//       console.error("Redis get problems list error:", err.message);
//     }
//   }

//   const [problems, total] = await Promise.all([
//     Problem.find(query)
//       .select("_id title difficulty tags")
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean(),
//     Problem.countDocuments(query),
//   ]);

//   const payload = {
//     success: true,
//     problems,
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//   };

//   if (isDefaultList && redisClient?.isOpen) {
//     try {
//       await redisClient.setEx(
//         PROBLEMS_LIST_KEY,
//         PROBLEMS_LIST_TTL_SECONDS,
//         JSON.stringify(payload)
//       );
//     } catch (err) {
//       console.error("Redis set problems list error:", err.message);
//     }
//   }

//   return payload;
// };

// // Fetch a single problem with optional attached video and Redis cache.
// export const getProblemByIdWithCache = async (id) => {
//   const key = `problem:${id}`;

//   if (redisClient?.isOpen) {
//     try {
//       const cached = await redisClient.get(key);
//       if (cached) {
//         return JSON.parse(cached);
//       }
//     } catch (err) {
//       console.error("Redis get problem error:", err.message);
//     }
//   }

//   const problem = await Problem.findById(id).select(
//     "_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution"
//   );

//   if (!problem) {
//     return null;
//   }

//   const videos = await SolutionVideo.findOne({ problemId: id });

//   let payload;
//   if (videos) {
//     payload = {
//       ...problem.toObject(),
//       secureUrl: videos.secureUrl,
//       thumbnailUrl: videos.thumbnailUrl,
//       duration: videos.duration,
//     };
//   } else {
//     payload = problem.toObject();
//   }

//   if (redisClient?.isOpen) {
//     try {
//       await redisClient.setEx(
//         key,
//         PROBLEM_TTL_SECONDS,
//         JSON.stringify(payload)
//       );
//     } catch (err) {
//       console.error("Redis set problem error:", err.message);
//     }
//   }

//   return payload;
// };

// // Invalidate caches when problems are created/updated/deleted.
// export const invalidateProblemCache = async (problemId) => {
//   if (!redisClient?.isOpen) return;

//   const keys = [PROBLEMS_LIST_KEY];
//   if (problemId) {
//     keys.push(`problem:${problemId}`);
//   }

//   try {
//     await redisClient.del(keys);
//   } catch (err) {
//     console.error("Redis invalidate problem cache error:", err.message);
//   }
// };

