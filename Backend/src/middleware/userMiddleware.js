import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {redisClient} from "../config/redis.js";

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is not present"
      });
    }

    // Verify the token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_KEY);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token expired"
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    const { _id } = payload;
    if (!_id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    // Check if the token is blocked in Redis (with graceful degradation)
    try {
      if (redisClient.isOpen) {
        const isBlocked = await redisClient.get(`token:${token}`);
        if (isBlocked) {
          return res.status(401).json({
            success: false,
            message: "Token has been revoked"
          });
        }
      }
    } catch (redisError) {
      // Continue without Redis check if Redis is unavailable
      console.warn('Redis check failed, continuing without cache:', redisError.message);
    }

    // Verify user exists in DB (with projection to exclude password)
    const user = await User.findById(_id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User doesn't exist"
      });
    }

    // Attach user to request for next middleware or route
    req.user = user;
    req.userId = _id; // Also attach userId for convenience

    next();

  } catch (error) {
    console.error('User middleware error:', error);
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

export default userMiddleware;


// import jwt from "jsonwebtoken"
// import User from "../models/user.js"
// import redisClient from "../config/redis.js";


// const userMiddleware=async (req,res,next)=>{
//     try {
        
//         const {token}=req.cookies;
//         if(!token) throw new Error("Token is not persent");

//         const payload=jwt.verify(token,process.env.JWT_KEY)

//         const {_id}=payload

//         if(!_id) throw new Error("Invalid token");

//         const result =await User.findById(_id)

//         if(!result) throw new Error("User Doesn't Exist");

//         if(IsBlock) throw new Error("Invalid Token");

//         req.result=result

//         next()
//         res.status(401).send("Error: "+ err.message)
//         // Redis ke blockList mein persent toh nahi hai

//     } catch (error) {
        
//     }
// }

// export default userMiddleware