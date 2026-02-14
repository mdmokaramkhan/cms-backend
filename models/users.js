import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "VIEWER"],
      default: "VIEWER"
    },
    profilePicture: {
      type: String,
      default: ""
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  // Hash password if it is new or modified
  if (!this.isModified("password")) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

});
export default mongoose.model("User", userSchema);
