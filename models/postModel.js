import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    message: { type: String },
    creatorId: { type: String },
    isCreatorAdmin: {type: Boolean, default: false},
    creatorLevel: { type: Number, default: 0},
    isCreatorOwner: {type: Boolean, default: false},
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
    creatorId: String,
    isCreatorAdmin: {type: Boolean, default: false},
    creatorLevel: { type: Number, default: 0},
    isCreatorOwner: {type: Boolean, default: false},
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
