import express from "express";
import { 
    getAllJobs,
    postJob,
    deleteJob,
    getPostedJobs,
    getApplicationsCount,
    getApplicationsByJobId
} from "../controllers/AdminControllers.js";

const router = express.Router();

// Route to get all posted jobs
router.get("/jobs", async (req, res) => {
    try {
        await getAllJobs(req, res);
    } catch (error) {
        console.error("Error in /jobs route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to post a new job
router.post("/jobs", async (req, res) => {
    try {
        await postJob(req, res);
    } catch (error) {
        console.error("Error in /jobs route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to delete a job post
router.delete("/jobs/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Job ID is required" });
    }

    try {
        await deleteJob(req, res);
    } catch (error) {
        console.error("Error in /jobs/:id route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to get posted jobs by admin
router.get("/postedjobs", async (req, res) => {
    try {
        await getPostedJobs(req, res);
    } catch (error) {
        console.error("Error in /postedjobs route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to get count of job applications
router.get("/applications/count", async (req, res) => {
    try {
        await getApplicationsCount(req, res);
    } catch (error) {
        console.error("Error in /applications/count route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to get applications by job ID
router.get("/applications/:jobId", async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
    }

    try {
        await getApplicationsByJobId(req, res);
    } catch (error) {
        console.error("Error in /applications/:jobId route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

// Route to delete a posted job by jobId
router.delete("/postedjobs/:jobId", async (req, res) => {
    const { jobId } = req.params;
    if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
    }

    try {
        await deleteJob(req, res);
    } catch (error) {
        console.error("Error in /postedjobs/:jobId route:", error.message);
        res.status(500).json({ message: "Internal Server Error. Please try again later." });
    }
});

export default router;
