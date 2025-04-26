import express from "express";
import { loginUser, googleLogin } from "../controllers/LoginControllers.js";

const router = express.Router();

// Regular Email/Password Login
router.post("/login", async (req, res) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        res.status(500).json({ message: "Error processing login request", error: error.message });
    }
});

// Google Sign-In
router.post("/google-login", async (req, res) => {
    try {
        await googleLogin(req, res);
    } catch (error) {
        res.status(500).json({ message: "Error processing Google login", error: error.message });
    }
});

export default router;
