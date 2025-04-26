import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import db from './utils/db.js';

// Import all routes
import userRoutes from "./Routes/UserRoutes.js";
import loginRoutes from "./Routes/LoginRoutes.js";
import fpRoutes from './Routes/fpRoutes.js';
import otpRoutes from './Routes/otpRoutes.js';
import cpRoutes from './Routes/cpRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import adminRoutes from './Routes/AdminRoutes.js';
import chatbotRoute from "./Routes/chatbotRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "kavindasithum127@gmail.com",
        pass: process.env.EMAIL_PASS || "vctv xlau neun iere",
    },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Email with Resume Attachment
app.post("/send-email", upload.single("resume"), (req, res) => {
    const { name, experience, email, mobile } = req.body;
    const resumePath = req.file?.path;

    const mailOptions = {
        from: process.env.EMAIL_USER || "kavindasithum127@gmail.com",
        to: process.env.RECIPIENT_EMAIL || "kwpchamikara99@gmail.com",
        subject: "New Job Application",
        html: `
            <h1>New Job Application</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Experience:</strong> ${experience} years</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
        `,
        attachments: resumePath ? [{
            filename: req.file.originalname,
            path: resumePath,
        }] : [],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).send("Error sending email");
        }
        console.log("Email sent:", info.response);
        return res.status(200).send("Email sent successfully");
    });
});

// Contact Form Submission
app.post('/contact_us', (req, res) => {
    const { name, phone_number, email, message } = req.body;
    const sql = "INSERT INTO contact_us(name, phone_number, email, message) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, phone_number, email, message], (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Data inserted successfully", data });
    });
});

// Mailing List Subscription
app.post('/mailing', (req, res) => {
    const sql = "INSERT INTO mailing(email) VALUES (?)";
    db.query(sql, [req.body.mailing_email], (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Email added to mailing list successfully", data });
    });
});

// Job Routes
app.get("/job/:id", (req, res) => {
    const query = "SELECT * FROM postedjobs WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error querying the database:", err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.json(result);
    });
});

app.get("/jobs", (req, res) => {
    const query = "SELECT id, job_title, company_name, company_type FROM postedjobs";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error querying the database:", err);
            return res.status(500).json({ error: "Database error" });
        }
        return res.json(results);
    });
});

// API Route to Store Code in Database
app.post("/api/enter-code", (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    db.query("INSERT INTO codes (code) VALUES (?)", [code], (err, result) => {
        if (err) {
            console.error("Error inserting code:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Code saved successfully", id: result.insertId });
    });
});

// Job Postings Routes
app.get("/api/jobs", (req, res) => {
    db.query("SELECT * FROM postedjobs", (err, results) => {
        if (err) {
            console.error("Error fetching jobs:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.delete("/api/jobs/:id", (req, res) => {
    const jobId = req.params.id;
    db.query("DELETE FROM postedjobs WHERE id = ?", [jobId], (err, result) => {
        if (err) {
            console.error("Error deleting job:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json({ message: "Job deleted successfully" });
    });
});

// Route Mounting
app.use('/api/inquiry', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', fpRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/password', cpRoutes);
app.use('/api/user', loginRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);
app.use("/api", adminRoutes);
app.use("/api/chatbot", chatbotRoute);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start Server with error handling
const startServer = async () => {
    try {
        await new Promise((resolve, reject) => {
            const server = app.listen(PORT)
                .once('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.error(`⚠️ Port ${PORT} is already in use. Trying port ${PORT + 1}`);
                        server.close();
                        app.listen(PORT + 1)
                            .once('listening', () => {
                                console.log(`✅ Server is running on http://localhost:${PORT + 1}`);
                                resolve();
                            })
                            .once('error', reject);
                    } else {
                        reject(err);
                    }
                })
                .once('listening', () => {
                    console.log(`✅ Server is running on http://localhost:${PORT}`);
                    resolve();
                });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
