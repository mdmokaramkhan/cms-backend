import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:id/comments", authMiddleware, addComment);
router.get("/:id/comments", getComments);

export default router;
