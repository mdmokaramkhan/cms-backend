import Comment from "../models/comment.js";

export const addCommentService = async ({
  artifactId,
  userId,
  text
}) => {
  if (!text) {
    throw new Error("Comment text is required");
  }

  return await Comment.create({
    artifact: artifactId,
    user: userId,
    text
  });
};

export const getCommentsService = async (artifactId) => {
  return await Comment.find({ artifact: artifactId })
    .populate("user", "name")
    .sort({ createdAt: -1 });
};
