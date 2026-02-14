import Artifact from "../models/artifact.js";
import Comment from "../models/comment.js";
import Like from "../models/likes.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { getCommentsService } from "./comment.service.js";
import { getLikeCountService } from "./likes.service.js";

// Create a new artifact
export const createArtifactService = async ({
  title,
  content,
  userId,
  filePath
}) => {
  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  let mediaUrl = null
  if (filePath) {
    const uploadResult = await cloudinary.uploader.upload(
      filePath,
      {
        folder: "cms-artifacts"
      }
    );

    mediaUrl = uploadResult.secure_url;

    fs.unlinkSync(filePath); // Delete local file after upload
  }
  console.log("MEDIA URL BEFORE SAVE:", mediaUrl);

  const artifact = await Artifact.create({
    title,
    content,
    author: userId,
    media: mediaUrl || null
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

/** Shuffle array in place (Fisher–Yates). */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Get all artifacts with comments and like count for each. Public access (no auth).
 * Returns artifacts in random order.
 */
export const getArtifactsWithDetailsService = async () => {
  const artifacts = await Artifact.find().populate("author", "name email role profilePicture").lean();
  if (artifacts.length === 0) {
    return { artifacts: [] };
  }

  shuffle(artifacts);

  const artifactIds = artifacts.map((a) => a._id);

  const [allComments, likeCounts] = await Promise.all([
    Comment.find({ artifact: { $in: artifactIds } })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean(),
    Like.aggregate([
      { $match: { artifact: { $in: artifactIds } } },
      { $group: { _id: "$artifact", count: { $sum: 1 } } }
    ])
  ]);

  const commentsByArtifact = new Map();
  for (const c of allComments) {
    const id = c.artifact.toString();
    if (!commentsByArtifact.has(id)) commentsByArtifact.set(id, []);
    commentsByArtifact.get(id).push(c);
  }

  const likeCountByArtifact = new Map(
    likeCounts.map((r) => [r._id.toString(), r.count])
  );

  const artifactsWithDetails = artifacts.map((a) => {
    const id = a._id.toString();
    return {
      ...a,
      comments: commentsByArtifact.get(id) || [],
      likeCount: likeCountByArtifact.get(id) || 0
    };
  });

  return { artifacts: artifactsWithDetails };
};

/**
 * Get a single artifact by ID with comments and like count for frontend display.
 * Access: admin can get any artifact; others only their own.
 */
export const getArtifactByIdWithDetailsService = async ({ artifactId, userId, role }) => {
  const artifact = await Artifact.findById(artifactId).populate("author", "name email role");
  if (!artifact) {
    return null;
  }

  const isOwner = String(artifact.author._id) === String(userId);
  const canAccess = role === "ADMIN" || isOwner;
  if (!canAccess) {
    return null;
  }

  const [comments, likeCount] = await Promise.all([
    getCommentsService(artifactId),
    getLikeCountService(artifactId)
  ]);

  return {
    artifact,
    comments,
    likeCount
  };
};

export const updateDraftToArchieveService = async () => {
  var currentDate = new Date().now();
  var thirdyDayOld = new Date(currentDate.getDate() - 30);
  const result = await Artifact.updateMany({ status: "draft", createdAt: { $lt: thirdyDayOld } }, { status: "archived" });
  return result;
}
