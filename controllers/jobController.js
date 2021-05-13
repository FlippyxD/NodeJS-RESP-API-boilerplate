// Models
import Job from "../models/jobModel.js";
import Company from "../models/companyModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";

// @desc	Get jobs
// @route	GET /api/v1/jobs
// @route	GET /api/v1/companies/:companyId/jobs
// @access	Public
export const getJobs = asyncWrapper(async (req, res) => {
    // Case -> GET /api/v1/companies/:companyId/jobs
    if (req.params.companyId) {
        const jobs = await Job.find({ company: req.params.companyId });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    }

    // Case ->GET /api/v1/jobs
    res.status(200).json(res.advancedResults);
});

// @desc	Get single job
// @route	GET /api/v1/jobs/:id
// @access	Public
export const getJob = asyncWrapper(async (req, res) => {
    // Get the job detail and populate it with name and description of company that offers the job
    const job = await Job.findById(req.params.id).populate({
        path: "company",
        select: "name description",
    });

    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }

    res.status(200).json({
        success: true,
        data: job,
    });
});

// @desc	Add a job
// @route	POST /api/v1/companies/companyId/jobs
// @access	Private
export const addJob = asyncWrapper(async (req, res) => {
    const company = await Company.findById(req.params.companyId);

    if (!company) {
        res.status(404);
        throw new Error("Company not found");
    }

    // Make sure user is company owner or an admin
    if (company.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.body.user} is not authorized to add a job to company ${company._id}`
        );
    }

    // Add user and company to req.body -> each job must have creator and company it falls under
    req.body.company = req.params.companyId;
    req.body.user = req.user.id;

    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        data: job,
    });
});

// @desc	Update job
// @route	PUT /api/v1/jobs/:id
// @access	Private
export const updateJob = asyncWrapper(async (req, res) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error("Job with that id was not found!");
    }

    // Make sure user is job creator (owner)
    if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to update a job ${job._id}`
        );
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    job.save();

    res.status(200).json({
        success: true,
        data: job,
    });
});

// @desc	Delete job
// @route	DELETE /api/v1/jobs/:id
// @access	Private
export const deleteJob = asyncWrapper(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error("Job with that id not found");
    }

    // Make sure user is job owner
    if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to delete a job ${job._id}`
        );
    }

    await job.remove();

    res.status(200).json({
        success: true,
        message: "Job removed!",
        data: {},
    });
});
