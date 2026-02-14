import fs from "fs";
import User from "../models/users.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Search users by name (public). Returns only name, id, profilePicture.
 */
export const searchUsersByNameService = async (nameQuery) => {
  if (!nameQuery || typeof nameQuery !== "string" || !nameQuery.trim()) {
    return [];
  }
  const regex = new RegExp(nameQuery.trim(), "i");
  const users = await User.find({ name: regex })
    .select("name _id profilePicture")
    .limit(50)
    .lean();
  return users.map((u) => ({
    id: u._id,
    name: u.name,
    profilePicture: u.profilePicture || ""
  }));
};

/**
 * Get account info for the authenticated user (by id)
 */
export const getAccountService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    verified: user.verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Update account info for the authenticated user
 * Only allows updating name, profilePicture; password would be a separate flow
 */
export const updateAccountService = async (userId, updates) => {
  const allowed = ["name", "profilePicture"];
  const payload = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      payload[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    verified: user.verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Update profile picture: upload file to Cloudinary and set user.profilePicture
 */
export const updateProfilePictureService = async (userId, filePath) => {
  if (!filePath) {
    throw new Error("No file provided");
  }

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: "cms-profile-pictures"
  });

  fs.unlinkSync(filePath);

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { profilePicture: uploadResult.secure_url } },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    verified: user.verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
