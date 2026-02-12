import express from "express";
import githubWebhook from "../webhook/webhook.js";

const webhooksRoutes = express.Router();

webhooksRoutes.post("/githubWebhook", githubWebhook);

export default webhooksRoutes;
