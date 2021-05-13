// Models
import Review from "../models/reviewModel.js";
import Company from "../models/companyModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";

// @desc	Get reviews
// @route	GET /api/v1/reviews
// @route	GET /api/v1/companies/:companyId/reviews
// @access	Public
export const getReviews = asyncWrapper(async (req, res) => {
    // Case -> GET /api/v1/companies/:companyId/reviews
    if (req.params.companyId) {
        const reviews = await Review.find({ company: req.params.companyId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    }

    // Case -> GET /api/v1/reviews
    return res.status(200).json(res.advancedResults);
});

// @desc	Get single review
// @route	GET /api/v1/reviews/:id
// @access	Public
export const getReview = asyncWrapper(async (req, res) => {
    console.log("---------");
    const review = await Review.findById(req.params.id).populate({
        path: "company",
        select: "name description",
    });

    if (!review) {
        res.status(404);
        throw new Error("Review not found");
    }

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @desc	Add review
// @route	POST /api/v1/companies/:companyId/reviews
// @access	Private
export const addReview = asyncWrapper(async (req, res) => {
    // Add parameters to req.body
    req.body.company = req.params.companyId;
    req.body.user = req.user.id;

    const company = await Company.findById(req.body.company);

    if (!company) {
        res.status(404);
        throw new Error(
            `No company with the id of ${req.body.company} have been found`
        );
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review,
    });
});

// @desc	Update review
// @route	PUT /api/v1/reviews/:id
// @access	Private
export const updateReview = asyncWrapper(async (req, res) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error("Review with that id not found");
    }

    // Make sure user is review owner OR user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to update review ${review._id}`
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    review.save();

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @desc	Delete review
// @route	DELETE /api/v1/reviews/:id
// @access	Private
export const deleteReview = asyncWrapper(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error("Review with that id not found");
    }

    // Make sure user is review owner OR user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to delete review ${review._id}`
        );
    }

    await review.remove();

    res.status(200).json({
        success: true,
        message: "Review removed",
        data: {},
    });
});
