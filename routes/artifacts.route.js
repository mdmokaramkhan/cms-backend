import express from "express";
import { createArtifact ,getArtifacts} from "../controllers/artifact.controller.js";
import { authMiddleware} from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middlware.js";
import rateLimiter from "../middlewares/ratelimitter.middleware.js";
import { upload } from "../middlewares/uploads.middleware.js";

const router = express.Router();

// Protected Artifact APIs
router.post("/", rateLimiter, authMiddleware, upload.single("file"), createArtifact);
router.get("/", rateLimiter, authMiddleware,authorizeRoles("ADMIN"), getArtifacts);
export default router;
