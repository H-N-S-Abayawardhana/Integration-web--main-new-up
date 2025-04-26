import express from 'express';
import { forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Route to request a password reset (Forgot password)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }

        await forgotPassword(req, res); // Delegate to the controller
    } catch (error) {
        console.error("Error in /forgot-password route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to verify the OTP for password reset
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate inputs
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        await verifyOTP(req, res); // Delegate to the controller
    } catch (error) {
        console.error("Error in /verify-otp route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to reset the password after OTP verification
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body;

        // Validate inputs
        if (!email || !newPassword || !otp) {
            return res.status(400).json({ message: 'Email, new password, and OTP are required' });
        }

        await resetPassword(req, res); // Delegate to the controller
    } catch (error) {
        console.error("Error in /reset-password route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

export default router;
