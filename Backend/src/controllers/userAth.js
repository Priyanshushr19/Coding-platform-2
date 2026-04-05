import { response } from "express";
import {redisClient} from "../config/redis.js";
import User from "../models/user.js";
import validate from "../utils.js/userAuth.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const register = async (req, res) => {
    try {
        // 1. Validate input data
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        // 2. Normalize email
        const normalizedEmail = emailId.toLowerCase().trim();

        // 3. Check if user already exists (prevent duplicate)
        const existingUser = await User.findOne({ emailId: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create user object (only include allowed fields)
        const newUser = {
            firstName: firstName?.trim(),
            lastName: req.body.lastName?.trim(),
            emailId: normalizedEmail,
            password: hashedPassword,
            age: req.body.age,
            role: "user"
        };

        // 6. Save user
        const user = await User.create(newUser);

        // 7. Create JWT token
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        // 8. Prepare return data (exclude sensitive fields)
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            profilePic: user.profilePic
        };

        // 9. Store token in cookie securely
        // res.cookie("token", token, {
        //     maxAge: 60 * 60 * 1000,
        //     httpOnly: true,
        //     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        //     secure: process.env.NODE_ENV === "production"
        // });
        res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // required for HTTPS (Render)
  sameSite: "None",    // 🔥 MUST for cross-origin
  maxAge: 60 * 60 * 1000
});

        // 10. Send final response
        return res.status(201).json({
            success: true,
            user: reply,
            message: "Registered Successfully"
        });

    } catch (error) {
        console.error("Register error:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};


// const register = async (req, res) => {
//     try {
//         validate(req.body);
//         const { firstName, emailId, password } = req.body;

        

//         req.body.password = await bcrypt.hash(password, 10);
//         req.body.role = 'user'

//         console.log("object");

//         const user = await User.create(req.body);
        
//         const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 60 * 60 })

//         const reply = {
//             firstName: user.firstName,
//             emailId: user.emailId,
//             _id: user._id,
//             role: user.role,
//         }

        

//         res.cookie('token', token, { maxAge: 60 * 60 * 1000 })
//         res.status(201).json({
//             user: reply,
//             message: "Loggin Successfully"
//         })

//     } catch (error) {
//         res.status(400).send("Error: " + error);
//     }
// }


const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Input validation
    if (!emailId || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Email validation
    if (typeof emailId !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Password length check
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Find user (normalize email to lowercase)
    const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });

    // Use consistent error message to prevent user enumeration
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const reply = {
      firstName: user.firstName || "User",
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
      profilePic: user.profilePic
    };

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 1000
    // });
      res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // required for HTTPS (Render)
  sameSite: "None",    // 🔥 MUST for cross-origin
  maxAge: 60 * 60 * 1000
});

    return res.status(200).json({
      success: true,
      user: reply,
      message: "Login Successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (token) {
      const payload = jwt.decode(token);

      // 🔥 Blacklist token
      await redisClient.set(`token:${token}`, "Blocked");
      await redisClient.expireAt(`token:${token}`, payload.exp);
    }

    // 🔥 CLEAR COOKIE (EXACT MATCH)
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      expires: new Date(0) // 🔥 THIS FIXES EVERYTHING
    });

    return res.status(200).json({
      success: true,
      message: "Logged Out Successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// const logout = async (req, res) => {
//   try {
//     const { token } = req.cookies;

//     if (!token) {
//       return res.status(400).json({ success: false, message: "No token found" });
//     }

//     // Verify the token first
//     const payload = jwt.verify(token, process.env.JWT_KEY);

//     // Block the token in Redis until it naturally expires
//     await redisClient.set(`token:${token}`, "Blocked");
//     await redisClient.expireAt(`token:${token}`, payload.exp);

//     // Clear the cookie
//     res.cookie("token", "", {
//       httpOnly: true,
//       expires: new Date(Date.now()),
//       sameSite: "strict",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.json({ success: true, message: "Logged out successfully" });

//   } catch (error) {
//     res.status(503).json({ success: false, message: error.message });
//   }
// };


const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        console.log("object");
        const { firstName, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User Registered Successfully");
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
}

const deleteProfile = async (req, res) => {

    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);
        res.status(200).send("Deleted Successfully");
    }
    catch (err) {

        res.status(500).send("Internal Server Error");
    }
}


const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });


    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path }, // Cloudinary URL ✅
      { new: true }
    );


    res.status(200).json({
      success: true,
      imageUrl: req.file.path, // ✅ will show cloudinary link
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


export { register, login, logout , adminRegister, deleteProfile, updateProfilePic}
