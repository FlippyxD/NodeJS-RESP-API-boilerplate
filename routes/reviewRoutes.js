import express from "express";

// Models
import Review from "../models/reviewModel.js";

// Controllers
import {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";

// Middlewares
import { advancedResults } from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(
        advancedResults(Review, {
            path: "company",
            select: "name description",
        }),
        getReviews
    )
    .post(protect, authorize("user", "admin"), addReview);

router
    .route("/:id")
    .get(getReview)
    .put(protect, authorize("user", "admin"), updateReview)
    .delete(protect, authorize("user", "admin"), deleteReview);

export default router;
