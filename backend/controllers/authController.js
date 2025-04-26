import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import transporter from '../config/mailer.js';

// Generate OTP (6-digit)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// **Send OTP to Email**
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();

    try {
        // Check if the user exists
        const results = await User.findByEmail(email);
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update OTP in the database
        await User.updateOTP(email, otp);

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// **Verify OTP**
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        // Verify OTP in database
        const results = await User.verifyOTP(email, otp);
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Generate a JWT token for password reset
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
        res.json({ message: 'OTP verified', token });
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// **Reset Password**
export const resetPassword = async (req, res) => {
    const { email, newPassword, token } = req.body;

    // Validate input
    if (!email || !newPassword || !token) {
        return res.status(400).json({ message: 'Email, new password, and token are required' });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== email) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Hash the new password
        const hash = await bcrypt.hash(newPassword, 10);

        // Update password in the database
        await User.updatePassword(email, hash);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};
