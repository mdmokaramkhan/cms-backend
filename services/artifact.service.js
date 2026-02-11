import Artifact from "../models/artifact.js";

/**
 * Create a new artifact
 */
export const createArtifactService = async ({
  title,
  content,
  userId
}) => {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const artifact = await Artifact.create({
    title,
    content,
    author: userId
  });

  return artifact;
};









export const getArtifactsService = async ({ userId, role }) => {
  if (role === "ADMIN") {
    // Admin sees everything
    return await Artifact.find().populate("author", "name email role");
  }

  // Non-admin sees only their own artifacts
  return await Artifact.find({ author: userId });
};