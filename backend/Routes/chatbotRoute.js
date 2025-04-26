import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

const HF_API_KEY = process.env.HUGGING_FACE_ACCESS_TOKEN_KEY;
const API_URL = process.env.HUGGINGFACE_MODEL2; // Free QA Model ...
const companyInfo = process.env.COMPANY_DETAILS2; // Company context info

// Function to call Hugging Face model
const queryHuggingFaceModel = async (message) => {
    try {
        const response = await axios.post(
            API_URL,
            { question: message, context: companyInfo },
            { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error querying Hugging Face model:", error.response ? error.response.data : error.message);
        throw new Error("Error querying Hugging Face model.");
    }
};

// Function to detect if a message is a greeting
const isGreeting = (message) => {
    const greetingPatterns = /\b(hello|hi|hey|good\s(morning|afternoon|evening|night)|greetings|what’s up|howdy|sup|yo)\b/i;
    return greetingPatterns.test(message);
};

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Validate message input
        if (!message || message.trim() === '') {
            return res.status(400).send("Message is required.");
        }

        console.log("User Message:", message);

        // Handle greetings dynamically
        if (isGreeting(message)) {
            return res.status(200).send("Hello! How can I assist you with Gamage Recruiters today?");
        }

        // Query the Hugging Face model for company-related answers
        const response = await queryHuggingFaceModel(message);

        let reply = response?.answer || "";
        let confidenceScore = response?.score || 0;

        console.log("Raw Model Response:", response);

        // If the model is unsure, return a general company response
        if (!reply || reply.length < 3 || confidenceScore < 0.3) {
            reply = "I'm sorry, but I can only provide information about Gamage Recruiters. Please visit https://xyzcompany.com for more details.";
        }

        // Check if the message is related to the company (based on keywords)
        const companyKeywords = process.env.COMPANY_KEYWORDS ? process.env.COMPANY_KEYWORDS.split(',') : [];
        const isCompanyRelated = companyKeywords.some(keyword => message.toLowerCase().includes(keyword));

        if (!reply || reply.length < 3 || confidenceScore < 0.3) {
            // If the message is company-related, provide a more general response
            if (isCompanyRelated) {
                reply = "Gamage Recruiters is a recruitment agency specializing in staffing solutions. For more details, visit https://xyzcompany.com.";
            } else {
                // If it's unrelated, return the default message
                reply = "I'm sorry, but I can only provide information about Gamage Recruiters. Please visit https://xyzcompany.com for more details.";
            }
        }

        console.log("Final Reply:", reply, "| Confidence Score:", confidenceScore);
        res.status(200).send(reply);

    } catch (error) {
        console.error("Error in chatbot route:", error.message);
        res.status(500).send("Chatbot is currently unavailable. Please try again later.");
    }
});

export default router;
