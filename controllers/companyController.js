import path from "path";

// Models
import Company from "../models/companyModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";
import geocoder from "../utils/geocoder.js";

// @desc	Get all companies
// @route	GET /api/v1/companies
// @access	Public
export const getCompanies = asyncWrapper(async (req, res) => {
    res.status(200).json(res.advancedResults);
});

// @desc	Get single company
// @route	GET /api/v1/companies/:id
// @access	Public
export const getCompany = asyncWrapper(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
        res.status(404);
        throw new Error("Company not found");
    }

    res.json(company);
});

// @desc	Create new company
// @route	POST /api/v1/companies/
// @access	Private
export const createCompany = asyncWrapper(async (req, res) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if user already created a company
    const registeredCompany = await Company.findOne({ user: req.user.id });

    // If the user is not the admin, they can only add one company
    if (registeredCompany && req.user.role !== "admin") {
        res.status(400);
        throw new Error(
            `The user with ID ${req.user.id} has already registered a company`
        );
    }

    const company = await Company.create(req.body);

    res.status(201).json({
        success: true,
        data: company,
    });
});

// @desc	Update company
// @route	PUT /api/v1/companies/:id
// @access	Private
export const updateCompany = asyncWrapper(async (req, res) => {
    let company = await Company.findById(req.params.id);

    if (!company) {
        res.status(404);
        throw new Error("Company not found");
    }

    // Make sure user is company owner or an admin
    if (company.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to update this company`
        );
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.json({
        success: true,
        data: company,
    });
});

// @desc	Delete company
// @route	DELETE /api/v1/companies/:id
// @access	Private
export const deleteCompany = asyncWrapper(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
        //If there is no match for company, send 404 Not found and fail message
        res.status(404);
        throw new Error("Company not found");
    }

    // Make sure user is company owner OR an admin
    if (company.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to delete this company`
        );
    }

    // If we found match, remove the company
    await company.remove();

    // After removing send message
    res.json({
        message: "Company removed",
    });
});

// @desc	Get Companies within a radius
// @route	GET /api/v1/companies/radius/:zipcode/:distance
// @access	Private
export const getCompaniesInRadius = asyncWrapper(async (req, res) => {
    // Check if company exists in our DB
    const { zipcode, distance } = req.params;

    // Get lat/lg from geocoder
    const [{ latitude, longitude }] = await geocoder.geocode(zipcode);

    // Calculate the radius using radians
    // Divide distance by radius of Earth
    // Earth radius = 6 371 km
    const earthRadiusKm = 6371;
    const radius = distance / earthRadiusKm;

    // Get the companies in the area
    const companies = await Company.find({
        location: {
            $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
        },
    });

    res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
    });
});

// @desc	Upload photo for company
// @route	PUT /api/v1/companies/:id/photo
// @access	Private
export const companyPhotoUpload = asyncWrapper(async (req, res) => {
    // Check if company exists in our DB
    const company = await Company.findById(req.params.id);

    if (!company) {
        res.status(404);
        throw new Error(`Company with id of ${req.params.id} was not found!`);
    }

    // Make sure user is company owner or an admin
    if (company.user.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(401);
        throw new Error(
            `User ${req.user.id} is not authorized to update this company`
        );
    }

    // Check if file has been send
    if (!req.files) {
        res.status(400);
        throw new Error("Please upload a file");
    }

    const file = req.files.file;

    // Validation if image is a photo
    if (!file.mimetype.startsWith("image")) {
        res.status(400);
        throw new Error("Please upload an image file");
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        res.status(400);
        throw new Error(
            `Please upload an image with size lesser than ${process.env.MAX_FILE_UPLOAD}`
        );
    }

    // Create custom filename
    file.name = `photo_${company._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
        try {
            await Company.findByIdAndUpdate(req.params.id, { photo: file.name });

            res.status(200).json({
                sucess: true,
                data: file.name,
            });
        } catch (error) {
            console.log(error);
        }
    });

    if (error) {
        res.status(500);
        throw new Error(`Problem with file upload`);
    }
});
