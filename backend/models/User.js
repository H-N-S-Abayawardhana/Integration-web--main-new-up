import db from '../utils/db.js';

class User {
    // Get user by email
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
            return rows[0] || null; // Return a single user or null
        } catch (error) {
            throw new Error(`findByEmail error: ${error.message}`);
        }
    }

    // Update user's OTP
    static async updateOTP(email, otp) {
        try {
            const [result] = await db.query('UPDATE user SET otp = ? WHERE email = ?', [otp, email]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`updateOTP error: ${error.message}`);
        }
    }

    // Verify OTP
    static async verifyOTP(email, otp) {
        try {
            const [rows] = await db.query('SELECT * FROM user WHERE email = ? AND otp = ?', [email, otp]);
            return rows[0] || null; // Return user if OTP matches
        } catch (error) {
            throw new Error(`verifyOTP error: ${error.message}`);
        }
    }

    // Update password
    static async updatePassword(email, hashedPassword) {
        try {
            const [result] = await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`updatePassword error: ${error.message}`);
        }
    }
}

export default User;
