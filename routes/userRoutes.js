import express from "express";

// Models
import User from "../models/userModel.js";

// Controllers
import {
    getUser,
    getUsers,
    createUser,
    deleteUser,
    updateUser,
} from "../controllers/userController.js";

// Middlewares
import { advancedResults } from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route under this, will be protected AND you need to be admin to access them
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
