import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure necessary environment variables are defined
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER and EMAIL_PASS environment variables are not set');
    process.exit(1); // Exit the application if email credentials are not available
}

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Use the email user from the environment
        pass: process.env.EMAIL_PASS,  // Use the email password from the environment
    },
});

// Test the email transport to ensure it's configured correctly
transporter.verify((error, success) => {
    if (error) {
        console.error('Error setting up email transporter:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

export default transporter;
