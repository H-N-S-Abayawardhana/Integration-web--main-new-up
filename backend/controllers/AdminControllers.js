import db from "../utils/db.js";

// Get all unique job postings (one per job_title + state)
export const getAllJobs = async (req, res) => {
    const query = `
        SELECT pj.*, 
               (SELECT COUNT(*) 
                FROM postedjobs p 
                WHERE p.job_title = pj.job_title AND p.state = pj.state) AS applications_count
        FROM postedjobs pj 
        WHERE pj.id = (
            SELECT MIN(id) 
            FROM postedjobs 
            WHERE job_title = pj.job_title AND state = pj.state
        )
        ORDER BY pj.posted_at DESC
    `;

    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ error: "Database error", details: err });
    }
};

// Post a new job
export const postJob = async (req, res) => {
    const { job_title, state, salary, currency, location, description } = req.body;

    if (!job_title || !state || !salary || !currency || !location || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = `
        INSERT INTO postedjobs 
        (job_title, state, salary, currency, location, description, posted_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
        const [result] = await db.query(query, [
            job_title,
            state,
            salary,
            currency,
            location,
            description,
        ]);
        res.status(201).json({ message: "Job posted successfully", jobId: result.insertId });
    } catch (err) {
        console.error("Error posting job:", err);
        res.status(500).json({ error: "Database error", details: err });
    }
};

// Delete a job post
export const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        const [job] = await db.query("SELECT * FROM postedjobs WHERE id = ?", [id]);

        if (job.length === 0) {
            return res.status(404).json({ message: "Job post not found" });
        }

        const [result] = await db.query("DELETE FROM postedjobs WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job post not found" });
        }

        res.status(200).json({ message: "Job post deleted successfully" });
    } catch (err) {
        console.error("Error deleting job:", err);
        res.status(500).json({ error: "Database error", details: err });
    }
};

// Get all posted jobs (full list)
export const getPostedJobs = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM postedjobs ORDER BY id DESC");
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching posted jobs:", err);
        res.status(500).json({ message: "Database error" });
    }
};

// Get total number of applications
export const getApplicationsCount = async (req, res) => {
    try {
        const [results] = await db.query("SELECT COUNT(*) AS total FROM applyjob");
        res.status(200).json(results[0]);
    } catch (err) {
        console.error("Error fetching application count:", err);
        res.status(500).json({ message: "Database error" });
    }
};

// Get applications for a specific job
export const getApplicationsByJobId = async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
    }

    const query = `
        SELECT a.id, a.name, a.email, a.mobile_number, a.experience_years, a.cv_resume, 
               p.job_title
        FROM applyjob a
        JOIN postedjobs p ON a.job_id = p.id
        WHERE a.job_id = ?
    `;

    try {
        const [results] = await db.query(query, [jobId]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ message: "Database query error", details: err });
    }
};
