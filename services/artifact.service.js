import Artifact from "../models/artifact.js";

// Create a new artifact
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
    // Admin can see all artifacts
    return await Artifact.find().populate("author", "name email role");
  }

  // Non-admin can see only their own artifacts
  return await Artifact.find({ author: userId });
};

export const updateDraftToArchieveService = async () => {
  var currentDate = new Date().now();
  var thirdyDayOld = new Date(currentDate.getDate() - 30);
  const result = await Artifact.updateMany({ status: "draft", createdAt: { $lt: thirdyDayOld } }, { status: "archived" });
  return result;
}
