import db from "../utils/db.js";
import bcrypt from "bcryptjs";

// Handle user inquiry
export const addInquiry = async (req, res) => {
    const { fullname, companyname, jobtitle, phone, email, message } = req.body;

    if (!fullname || !companyname || !jobtitle || !phone || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO inquiries (fullname, companyname, jobtitle, phone, email, message) VALUES (?, ?, ?, ?, ?, ?)",
            [fullname, companyname, jobtitle, phone, email, message]
        );

        return res.status(201).json({ message: "Inquiry sent successfully" });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Register a new user
export const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword, isAdmin = false } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.query(
            "INSERT INTO user (name, email, password, isAdmin) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, isAdmin]
        );

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
