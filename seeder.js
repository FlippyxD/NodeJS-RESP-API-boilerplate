import fs from "fs";
import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";
import path from "path";

// Import database
import connectDB from "./config/db.js";

// Load models
import Company from "./models/companyModel.js";
import Job from "./models/jobModel.js";
import User from "./models/userModel.js";
import Review from "./models/reviewModel.js";

// Load env variables
dotenv.config({ path: "./config/.env" });

connectDB();

// Read JSON files
const __dirname = path.resolve();
const companies = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/companies.json`, "utf-8")
);
const jobs = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/jobs.json`, "utf-8")
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

// Import into DB
const importData = async () => {
    try {
        await Company.create(companies);
        await Job.create(jobs);
        await User.create(users);
        await Review.create(reviews);

        console.log("Data Importe...".green.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Company.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log("Data deleted...".red.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
};

if (process.argv[2] === "-d") {
    deleteData();
} else {
    importData();
}
