import express from 'express';
import { registerUser, addInquiry } from '../controllers/UserControllers.js';

const router = express.Router();

// User registration route
router.post('/signup', registerUser);

// Inquiry submission route
router.post('/inquiry', addInquiry);

export default router;
