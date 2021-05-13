import express from "express";

//Models
import Job from "../models/jobModel.js";

//Controllers
import {
    getJobs,
    getJob,
    addJob,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";

// Middleware
import { advancedResults } from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(
        advancedResults(Job, {
            path: "company",
            select: "name description",
        }),
        getJobs
    )
    .post(protect, authorize("recruiter", "admin"), addJob);
router
    .route("/:id")
    .get(getJob)
    .put(protect, authorize("recruiter", "admin"), updateJob)
    .delete(protect, authorize("recruiter", "admin"), deleteJob);

export default router;
