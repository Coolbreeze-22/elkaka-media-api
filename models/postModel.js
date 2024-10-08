import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    creator: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

const postSchema = mongoose.Schema(
  {
    name: String,
    title: String,
    message: String,
    selectedFile: String,
    tags: [String],
    creator: String,
    likes: {
      type: [String],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    // comments: [commentSchema],
  },
  { timestamps: true }
);

const postModel = mongoose.model("postModel", postSchema);

export default postModel;
