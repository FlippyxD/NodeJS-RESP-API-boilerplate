import crypto from "crypto";

// Models
import User from "../models/userModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";
import sendEmail from "../utils/sendEmail.js";

// @desc	Register user
// @route	POST /api/v1/auth/register
// @access	Public
export const register = asyncWrapper(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    // Grab token and send to email
    const confirmEmailToken = user.generateEmailConfirmToken();

    // Create reset URL
    const confirmEmailURL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

    user.save({ validateBeforeSave: false });

    const sendResult = await sendEmail({
        email: user.email,
        subject: "Email confirmation token",
        message,
    });

    console.log(message);

    sendTokenResponse(user, 200, res);
});

// @desc	Login user
// @route	POST /api/v1/auth/login
// @access	Public
export const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide an email and password");
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    sendTokenResponse(user, 200, res);
});

// @desc	Get current logged in user
// @route	GET /api/v1/auth/me
// @access	Private
export const getMe = asyncWrapper(async (req, res) => {
    // const user = await User.findById(req.user.id);
    // User is already availible in req due to the protect middleware
    const user = req.user;

    if (!user) {
        res.status(404);
        throw new Error("You are currently not logged in");
    }

    res.status(200).json({
        sucess: true,
        data: user,
    });
});

// @desc	Log user out / clear cookie
// @route	GET /api/v1/auth/logout
// @access	Private
export const logout = asyncWrapper(async (req, res) => {
    // Remove cookie
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000), // expire in 10 sec
        httpOnly: true,
    });

    res.status(200).json({
        sucess: true,
        message: "logged out",
        data: {},
    });
});

// @desc	Update user details
// @route	PUT /api/v1/auth/updatedetails
// @access	Private
export const updateDetails = asyncWrapper(async (req, res) => {
    // Configure options object
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        sucess: true,
        data: user,
    });
});

// @desc	Update password
// @route	GET /api/v1/auth/updatepassword
// @access	Private
export const updatePassword = asyncWrapper(async (req, res) => {
    // Get the user object with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        res.status(401);
        throw new Error("Incorrect password");
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc	Forgot password
// @route	POST /api/v1/auth/forgotpassword
// @access	Public
export const forgotPassword = asyncWrapper(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error("There is no user with that email");
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/auth/resetpassword/${resetToken}}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} !`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password reset token",
            message,
        });

        res.status(200).json({
            success: true,
            data: "Email send",
            message,
        });
    } catch (error) {
        console.error(error);
        user.getResetPasswordToken = undefined;
        user.getResetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error("Email could not be sent");
    }
});

// @desc	Reset password
// @route	PUT /api/v1/auth/resetpassword/:resettoken
// @access	Public
export const resetPassword = asyncWrapper(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");

    // console.log(resetPasswordToken, resetPasswordExpire);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid token");
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});

//@desc    Confirm Email
//@route   GET /api/v1/auth/confirmemail
//@access  Public
export const confirmEmail = asyncWrapper(async (req, res, next) => {
    // Grab token from email
    const { token } = req.query;

    if (!token) {
        res.status(400);
        throw new Error("Invalid token");
    }

    // Grab first part of the token
    const [splitToken] = token.split(".");

    const confirmEmailToken = crypto
        .createHash("sha256")
        .update(splitToken)
        .digest("hex");

    // Get user by token
    const user = await User.findOne({
        confirmEmailToken,
        isEmailConfirmed: false,
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid token");
    }

    // Update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;

    // Save
    user.save({ validateBeforeSave: false });

    // Return token
    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
export const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedWithJWT();

    // Configure options object
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
    });
};
