import express from 'express';
import { changePassword } from '../controllers/cpController.js';

const router = express.Router();

// Change password route
router.post('/change', async (req, res) => {
    try {
        // Ensure both email and newPassword are provided
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Call the changePassword controller function
        await changePassword(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error processing password change request', error: error.message });
    }
});

export default router;
