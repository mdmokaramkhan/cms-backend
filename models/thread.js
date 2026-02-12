import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Thread", threadSchema);
