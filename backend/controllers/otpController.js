import db from '../utils/db.js';

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        // Query the latest OTP for the given email
        const [results] = await db.query(
            'SELECT * FROM password_reset_requests WHERE email = ? ORDER BY requested_at DESC LIMIT 1',
            [email]
        );

        if (results.length === 0) {
            return res.status(400).json({ message: 'No OTP found for this email' });
        }

        const { otp: storedOTP, expires_at } = results[0];

        // Check if OTP has expired
        if (new Date() > new Date(expires_at)) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Check if the provided OTP matches the stored OTP
        if (storedOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP verification successful
        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Error in OTP verification:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
