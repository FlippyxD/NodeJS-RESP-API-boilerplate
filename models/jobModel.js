import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a course title"],
    },
    description: {
        type: String,
        required: [true, "Please add a description"],
    },
    yearsOfExperience: {
        type: Number,
        required: [true, "Please add a number of years of experience"],
    },
    salary: {
        type: Number,
        required: [true, "Please add a tuition cost"],
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add a minimum skill"],
        enum: ["junior", "medior", "senior"],
    },
    entryLevelJob: {
        type: Boolean,
        default: false,
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

// !!!! Static method to get avg of company salaries
jobSchema.statics.getAverageSalary = async function (companyId) {
    const obj = await this.aggregate([
        {
            $match: { company: companyId },
        },
        {
            $group: {
                _id: "$company",
                averageSalary: { $avg: "$salary" },
            },
        },
    ]);

    try {
        // await this.model("Company").findByIdAndUpdate(companyId, {
        // 	averageSalary: Math.ceil(obj[0].averageSalary / 10) * 10,
        // });

        if (obj[0]) {
            await this.model("Company").findByIdAndUpdate(companyId, {
                averageSalary: Math.ceil(obj[0].averageSalary),
            });
        } else {
            await this.model("Company").findByIdAndUpdate(companyId, {
                averageSalary: undefined,
            });
        }
    } catch (error) {
        console.error(error);
    }
};

// Call getAverageSalary after save
jobSchema.post("save", async function () {
    await this.constructor.getAverageSalary(this.company);
});

// Call getAverageSalary after removal of a job
jobSchema.post("remove", async function () {
    await this.constructor.getAverageSalary(this.company);
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
