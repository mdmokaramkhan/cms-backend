import express from "express";
import { createArtifact, getArtifacts, getArtifactById, getArtifactsPublic } from "../controllers/artifact.controller.js";
import { authMiddleware} from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middlware.js";
import rateLimiter from "../middlewares/ratelimitter.middleware.js";
import { upload } from "../middlewares/uploads.middleware.js";

const router = express.Router();

// Public: all artifacts with comments and like count (no auth)
router.get("/", rateLimiter, getArtifactsPublic);

// Protected Artifact APIs
router.post("/", rateLimiter, authMiddleware, upload.single("file"), createArtifact);
router.get("/admin", rateLimiter, authMiddleware, authorizeRoles("ADMIN"), getArtifacts);
router.get("/:id", rateLimiter, authMiddleware, getArtifactById);
export default router;
