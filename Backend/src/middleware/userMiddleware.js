import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {redisClient} from "../config/redis.js";

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is not present");

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) throw new Error("Invalid token");

    // Check if the token is blocked in Redis
    const isBlocked = await redisClient.get(token);
    if (isBlocked) throw new Error("Token is blocked");

    // Verify user exists in DB
    const user = await User.findById(_id);
    if (!user) throw new Error("User doesn't exist");

    // Attach user to request for next middleware or route
    req.user = user;
    console.log("Cookies received:", req.cookies);

    // Move to the next middleware
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default userMiddleware;


// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import { redisClient } from "../config/redis.js";

// const userMiddleware = async (req, res, next) => {
//   try {
//     const { token } = req.cookies;

//     // ❌ No token
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Token is not present"
//       });
//     }

//     // 🔐 Verify JWT
//     let payload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_KEY);
//     } catch (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({
//           success: false,
//           message: "Token expired"
//         });
//       }

//       return res.status(401).json({
//         success: false,
//         message: "Invalid token"
//       });
//     }

//     const { _id } = payload;

//     if (!_id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token payload"
//       });
//     }

//     // 🔥 Redis blacklist check (SAFE VERSION)
//     try {
//       const isBlocked = await redisClient.get(`token:${token}`);

//       if (isBlocked) {
//         return res.status(401).json({
//           success: false,
//           message: "Token has been revoked (logged out)"
//         });
//       }
//     } catch (redisError) {
//       // ✅ DO NOT break app if Redis fails
//       console.warn("Redis error, skipping blacklist check:", redisError.message);
//     }

//     // 🔍 Check user exists
//     const user = await User.findById(_id).select("-password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User does not exist"
//       });
//     }

//     // ✅ Attach user
//     req.user = user;
//     req.userId = _id;

//     next();

//   } catch (error) {
//     console.error("User middleware error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Authentication error"
//     });
//   }
// };

// export default userMiddleware;

// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import {redisClient} from "../config/redis.js";

// const userMiddleware = async (req, res, next) => {
//   try {
//     const { token } = req.cookies;
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Token is not present"
//       });
//     }

//     // Verify the token
//     let payload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_KEY);
//     } catch (jwtError) {
//       if (jwtError.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           success: false,
//           message: "Token expired"
//         });
//       }
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token"
//       });
//     }

//     const { _id } = payload;
//     if (!_id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token payload"
//       });
//     }

//     // Check if the token is blocked in Redis (with graceful degradation)
//     try {
//       if (redisClient.isOpen) {
//         const isBlocked = await redisClient.get(`token:${token}`);
//         if (isBlocked) {
//           return res.status(401).json({
//             success: false,
//             message: "Token has been revoked"
//           });
//         }
//       }
//     } catch (redisError) {
//       // Continue without Redis check if Redis is unavailable
//       console.warn('Redis check failed, continuing without cache:', redisError.message);
//     }

//     // Verify user exists in DB (with projection to exclude password)
//     const user = await User.findById(_id).select('-password');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User doesn't exist"
//       });
//     }

//     // Attach user to request for next middleware or route
//     req.user = user;
//     req.userId = _id; // Also attach userId for convenience

//     next();

//   } catch (error) {
//     console.error('User middleware error:', error);
//     return res.status(500).json({
//       success: false,
//       message: "Authentication error"
//     });
//   }
// };

// export default userMiddleware;

