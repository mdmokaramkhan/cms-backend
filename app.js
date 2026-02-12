import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import artifactRoutes from "./routes/artifacts.route.js"
import likes from "./routes/likes.routes.js";
import comment from "./routes/comment.route.js";
import cookieParser from "cookie-parser";
import { scheduledFunction } from "./cron/testing.js";
import webhooksRoutes from "./routes/webhooks.route.js";

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

app.use(cookieParser());

// testingFunction();
scheduledFunction();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CMS-Backend is running"
  });
});

app.use("/auth",authRoutes);
app.use("/artifacts", artifactRoutes);
app.use("/likes", likes);
app.use("/comments", comment);
app.use("/webhooks", webhooksRoutes);

export default app;
