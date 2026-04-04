import rateLimit from "express-rate-limit";

// Global API limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many API requests. Please try again later." }
});

// Login/Register limiter
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again later." }
});

// Code submission limiter
export const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many submissions. Please wait before submitting again." }
});

// Run code limiter
export const runLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many code runs. Please slow down." }
});