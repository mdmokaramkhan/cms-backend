import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    artifact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artifact",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ artifact: 1, user: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
