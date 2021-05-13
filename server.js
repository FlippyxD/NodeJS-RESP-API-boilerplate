import dotenv from "dotenv";
import colors from "colors";

// App object
import app from "./app.js";

// Import MongoDB
import connectDB from "./config/db.js";

// Load env vars
dotenv.config({ path: "./config/.env" });

// Init MongoDB -> must be under dotenv.config
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
    )
);
