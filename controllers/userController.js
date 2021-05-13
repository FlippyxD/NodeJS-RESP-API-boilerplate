// Models
import User from "../models/userModel.js";

// Utils
import asyncWrapper from "../utils/asyncWrapper.js";

// @desc	Get all users
// @route	GET /api/v1/users
// @access	Private/Admin
export const getUsers = asyncWrapper(async (req, res) => {
    res.status(200).json(res.advancedResults);
});

// @desc	Create user
// @route	POST /api/v1/users/:id
// @access	Private/Admin
export const getUser = asyncWrapper(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("There is no user with that ID");
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc	Create user
// @route	GET /api/v1/users
// @access	Private/Admin
export const createUser = asyncWrapper(async (req, res) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

// @desc	Update user
// @route	PUT /api/v1/users/:id
// @access	Private/Admin
export const updateUser = asyncWrapper(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        res.status(404);
        throw new Error("There is no user with that ID");
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc	Delete user
// @route	DELETE /api/v1/users/:id
// @access	Private/Admin
export const deleteUser = asyncWrapper(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("There is no user with that ID");
    }

    res.status(200).json({
        success: true,
        data: {},
    });
});
