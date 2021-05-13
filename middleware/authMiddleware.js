import jwt, { decode } from "jsonwebtoken";

// Models
import User from "../models/userModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";

//Protect routes
export const protect = asyncWrapper(async (req, res, next) => {
    let token;

    // Token in headers
    // if (
    //     req.headers.authorization &&
    //     req.headers.authorization.startsWith("Bearer")
    // ) {
    //     // Set token from Bearer token in header
    //     token = req.headers.authorization.split(" ")[1];
    // }

    // Set token from cookie
    if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

// Grand access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(
                `User role ${req.user.role} is not authorized to access this route`
            );
        }
        next();
    };
};
