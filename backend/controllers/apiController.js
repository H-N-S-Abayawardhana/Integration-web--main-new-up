const upload = require("./FileUpload");
const db = require("../utils/db");
const sendEmail = require("../utils/Email"); // Assuming sendEmail is in utils

// Function to handle form submission and insert data into the applyjob table
const handleApplyJob = async (req, res) => {
    const { name, experience, email, mobile } = req.body;
    const resumePath = req.file?.path;

    // Validate that all required fields are provided
    if (!name || !experience || !email || !mobile || !resumePath) {
        return res.status(400).send("All fields (name, experience, email, mobile, and resume) are required.");
    }

    const query = `
        INSERT INTO applyjob (name, email, mobile_number, experience_years, cv_resume)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [results] = await db.query(query, [name, email, mobile, experience, resumePath]);
        console.log("Data inserted into applyjob table:", results);
        res.status(200).send("Application submitted successfully");
    } catch (error) {
        console.error("Error inserting data into applyjob table:", error);
        res.status(500).send("Error submitting application");
    }
};

// Function to handle the form submission and file upload
const handleFormSubmission = async (req, res) => {
    const { name, experience, email, mobile } = req.body;
    const resumePath = req.file?.path;

    // Validate that all required fields are provided
    if (!name || !experience || !email || !mobile || !resumePath) {
        return res.status(400).send("All fields (name, experience, email, mobile, and resume) are required.");
    }

    try {
        // Use the sendEmail function from Email.js
        const info = await sendEmail(name, experience, email, mobile, resumePath);
        console.log("Email sent:", info.response);
        res.status(200).send("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending email");
    }
};

module.exports = { handleFormSubmission, handleApplyJob };

