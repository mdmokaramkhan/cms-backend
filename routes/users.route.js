import express from "express";
import { getAccount, updateAccount, updateProfilePicture, searchByName } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/uploads.middleware.js";

const router = express.Router();

// Public: search users by name (returns name, id, profilePicture only)
router.get("/search", searchByName);

// Protected routes
router.get("/account", authMiddleware, getAccount);
router.put("/account", authMiddleware, updateAccount);
// Profile picture: same multer + Cloudinary flow as artifacts (field: file)
router.put("/account/profile-picture", authMiddleware, upload.single("file"), updateProfilePicture);

export default router;
