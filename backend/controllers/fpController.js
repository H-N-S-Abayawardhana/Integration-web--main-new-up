import db from '../utils/db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const EMAIL_USER = 'your-email@gmail.com';  // Replace with your actual email
const EMAIL_PASS = 'your-app-password';  // Replace with your actual app password

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Generate OTP function
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Forgot password handler
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Check if the user exists in the database
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(200).json({ message: 'If this email exists, an OTP has been sent.' });
        }

        // Check if there's an existing unexpired OTP request
        const [existingRequest] = await db.query('SELECT * FROM password_reset_requests WHERE email = ? AND expires_at > NOW()', [email]);

        if (existingRequest.length > 0) {
            return res.status(400).json({ message: 'An OTP was already sent, please wait for it to expire or try again later.' });
        }

        // Generate OTP and set expiration time (10 minutes)
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Insert OTP into the password_reset_requests table
        await db.query('INSERT INTO password_reset_requests (email, otp, expires_at) VALUES (?, ?, ?)', [email, otp, expiresAt]);

        // Send OTP via email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'If this email exists, an OTP has been sent.' });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
