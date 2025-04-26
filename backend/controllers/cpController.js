import db from '../utils/db.js';
import bcrypt from 'bcrypt';

// Change password controller
export const changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    // Validate input fields
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Use promise-based DB query for better async/await handling
        const [result] = await db.promise().query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        // Check if user was found and updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ message: 'Server error', error: error.message || error });
    }
};
