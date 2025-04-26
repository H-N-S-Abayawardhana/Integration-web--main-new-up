import express from 'express';
import { forgotPassword } from '../controllers/fpController.js';

const router = express.Router();

// Forgot password route
router.post('/forgotpassword', async (req, res) => {
    try {
        await forgotPassword(req, res);
    } catch (error) {
        res.status(500).json({ message: "Error processing password reset request", error: error.message });
    }
});

export default router;
