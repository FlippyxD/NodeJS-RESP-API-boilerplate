import express from "express";

// Models
import Company from "../models/companyModel.js";

// Controllers
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompaniesInRadius,
    companyPhotoUpload,
} from "../controllers/companyController.js";

// Middleware
import { advancedResults } from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

// Include other ressource routers
import jobRoutes from "./jobRoutes.js";
import reviewRoutes from "./reviewRoutes.js";

const router = express.Router();

// Re-route into other resource routers
router.use("/:companyId/jobs", jobRoutes);
router.use("/:companyId/reviews", reviewRoutes);

router.route("/radius/:zipcode/:distance").get(getCompaniesInRadius);

router
    .route("/:id/photo")
    .put(protect, authorize("recruiter", "admin"), companyPhotoUpload);

router
    .route("/")
    .get(advancedResults(Company, "jobs"), getCompanies)
    .post(protect, authorize("recruiter", "admin"), createCompany);
router
    .route("/:id")
    .get(getCompany)
    .put(protect, authorize("recruiter", "admin"), updateCompany)
    .delete(protect, authorize("recruiter", "admin"), deleteCompany);

export default router;
