import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (email, otp) => {
    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your Gmail address
            pass: process.env.EMAIL_PASS   // Your Gmail App Password
        }
    });

    // Mail options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        text: `Your OTP code for password reset is: ${otp}`
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};

export default sendEmail;
