import {
  toggleLikeService,
  getLikeCountService
} from "../services/likes.service.js";

export const toggleLike = async (req, res) => {
  try {
    const result = await toggleLikeService({
      artifactId: req.params.id,
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getLikeCount = async (req, res) => {
  const count = await getLikeCountService(req.params.id);

  res.status(200).json({
    success: true,
    likes: count
  });
};
