import path from "path";

import express from "express";
import morgan from "morgan";
import fileupload from "express-fileupload";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Route files
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Body parser - middleware, without this, we would not have access to req.body in our controllers
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// FileUploading
app.use(fileupload());

// Set static folder
const __dirname = path.resolve();
app.use("/public", express.static(path.join(__dirname, "/uploads")));

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Basic route - can delete
app.get("/", (req, res) => {
    res.send("hello asdfasdf");
});

// Mount routers
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Error handler - MUST be at the bottom of the file
app.use(notFound);
app.use(errorHandler);

export default app;
