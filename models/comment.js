import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
