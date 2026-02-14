import {
  getAccountService,
  updateAccountService,
  updateProfilePictureService,
  searchUsersByNameService
} from "../services/user.service.js";

/**
 * GET /users/search?name=... – search users by name (public, no auth). Returns name, id, profilePicture only.
 */
export const searchByName = async (req, res) => {
  try {
    const name = req.query.name || "";
    const data = await searchUsersByNameService(name);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /users/account – get current user's account info (auth required)
 */
export const getAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const account = await getAccountService(userId);
    res.status(200).json({
      success: true,
      account
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /users/account – update current user's account info (auth required)
 * Body: { name?, profilePicture? }
 */
export const updateAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const account = await updateAccountService(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      account
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /users/account/profile-picture – upload profile picture (auth + multer file)
 * Form field: file (image)
 */
export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    if (!req.file?.path) {
      return res.status(400).json({
        success: false,
        message: "No file provided. Use multipart form with field 'file' (image)."
      });
    }

    const account = await updateProfilePictureService(userId, req.file.path);
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      account
    });
  } catch (error) {
    const status = error.message === "User not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
