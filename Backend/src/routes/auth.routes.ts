import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Register route
router.post("/register", authController.registerUser);

// Login route
router.post("/login", authController.loginUser);

// Get current user route (protected)
router.get("/get-me", authMiddleware.authUser, authController.getMe);

// Logout route
router.get("/logout", authController.logoutUser);

export default router;

