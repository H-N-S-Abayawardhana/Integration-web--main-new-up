import express from 'express';
import { verifyOTP } from '../controllers/otpController.js';

const router = express.Router();

// OTP verification route
router.post('/verifyotp', verifyOTP);

export default router;
