import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title for the review"],
        maxlength: 100,
    },
    text: {
        type: String,
        required: [true, "Please add some text"],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add a rating between 1 and 10"],
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: "Company",
        required: [true, "Each job must be linked to a company"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
});

// Prevent user from submitting more than one review per company
reviewSchema.index({ company: 1, user: 1 }, { unique: true });

// Static method to get avg rating
reviewSchema.statics.getAverageRating = async function (companyId) {
    const obj = await this.aggregate([
        {
            $match: { company: companyId },
        },
        {
            $group: {
                _id: "$company",
                averageRating: { $avg: "$rating" },
            },
        },
    ]);

    try {
        await this.model("Company").findByIdAndUpdate(companyId, {
            averageRating: obj[0].averageRating,
        });
    } catch (error) {
        console.error(error);
    }
};

// Call getAverageRating after save
reviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.company);
});

// Call getAverageRating after remove
reviewSchema.post("remove", function () {
    this.constructor.getAverageRating(this.company);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
