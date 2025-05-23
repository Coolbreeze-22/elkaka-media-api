import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";

const getPostsByPage = async (page, isCreate) => {
  const currentPage = Number(page);
  const LIMIT =
    isCreate & (currentPage === 1) ? 8 : isCreate & (currentPage > 1) ? 7 : 8;
  const startIndex = (currentPage - 1) * LIMIT;

  try {
    const total = await postModel.countDocuments({});
    const totalPages = Math.ceil(total / 8);
    const posts = await postModel
      .find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    return { posts, currentPage, totalPages };
  } catch (error) {
    throw error;
  }
};

export const getPosts = async (req, res) => {
  const isCreate = false;
  const { page } = req.query;
  try {
    const { posts, currentPage, totalPages } = await getPostsByPage(
      page,
      isCreate
    );
    res.status(200).json({ posts, currentPage, totalPages });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { title, tags, page } = req.query;
  const currentPage = Number(page);

  try {
    const singleTitle = new RegExp(title, "i");
    const isCommaInTitle = title.includes(",");
    const singleTag = new RegExp(tags, "i");
    const isCommaInTags = tags.includes(",");

    if (title && !isCommaInTitle && !tags) {
      const posts = await postModel
        .find({ title: singleTitle })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && isCommaInTitle && !tags) {
      const posts = await postModel
        .find({ title: { $in: title.split(",") } })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (tags && !isCommaInTags && !title) {
      const posts = await postModel.find({ tags: singleTag }).sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (tags && isCommaInTags && !title) {
      const posts = await postModel
        .find({ tags: { $in: tags.split(",") } })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && tags && !isCommaInTitle && !isCommaInTags) {
      const posts = await postModel
        .find({
          $or: [{ title: singleTitle }, { tags: singleTag }],
        })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && tags && isCommaInTitle && isCommaInTags) {
      const posts = await postModel
        .find({
          $or: [
            { title: { $in: title.split(",") } },
            { tags: { $in: tags.split(",") } },
          ],
        })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && tags && isCommaInTitle && !isCommaInTags) {
      const posts = await postModel
        .find({
          $or: [{ title: { $in: title.split(",") } }, { tags: singleTag }],
        })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && tags && !isCommaInTitle && isCommaInTags) {
      const posts = await postModel
        .find({
          $or: [{ title: singleTitle }, { tags: { $in: tags.split(",") } }],
        })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const isCreate = true;
  const { page } = req.query;
  const post = req.body;
  try {
    const postCreator = await userModel.findById(req.userId);
    const newPost = {
      ...post,
      creatorId: req.userId,
      isCreatorAdmin: postCreator.isAdmin,
      creatorLevel: postCreator.level,
      isCreatorOwner: postCreator.isOwner,
    };

    const createdPost = await new postModel(newPost).save();
    const { posts, currentPage, totalPages } = await getPostsByPage(
      page,
      isCreate
    );
    const finalPosts = Number(page) === 1 ? posts : [createdPost, ...posts];
    res.status(200).json({ finalPosts, currentPage, totalPages });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const deletePost = async (req, res) => {
  try {
    const sender = await userModel.findById(req.userId);
    const post = await postModel.findById(req.params.id);
    if (
      (sender.isOwner && !post.isCreatorOwner) ||
      String(sender._id) === post.creatorId
    ) {
      await postModel.findByIdAndRemove(req.params.id);
      res.status(200).json("Deleted Successfully");
    } else if (
      sender.isOwner &&
      post.isCreatorOwner &&
      (String(sender._id) === post.creatorId ||
        sender.level > post.creatorLevel)
    ) {
      await postModel.findByIdAndRemove(req.params.id);
      res.status(200).json("Deleted Successfully");
    } else if (
      !sender.isOwner &&
      !post.isCreatorOwner &&
      sender.isAdmin &&
      sender.level > post.creatorLevel
    ) {
      await postModel.findByIdAndRemove(req.params.id);
      res.status(200).json("Deleted Successfully");
    } else {
      res.status(403).json("Unauthorized to delete post");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (post.creatorId === req.userId) {
      const updatedPost = await postModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } else {
      res.status(403).json("Unauthorized to update post");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    if (!req.userId) return res.json({ message: "unauthenticated" });

    const post = await postModel.findById(req.params.id);
    const index = post.likes.findIndex((id) => id === String(req.userId));
    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(index, 1);
      // post.likes = post.likes.filter((id) => id !== String(req.userId));
    }
    const likedPost = await postModel.findByIdAndUpdate(req.params.id, post, {
      new: true,
    });
    res.status(200).json(likedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const commentCreator = await userModel.findById(req.userId);
    const newComment = {
      ...comment,
      creatorId: req.userId,
      isCreatorAdmin: commentCreator.isAdmin,
      creatorLevel: commentCreator.level,
      isCreatorOwner: commentCreator.isOwner,
    };

    const post = await postModel.findById(id);
    // post.comments = [...post.comments, newComment] OR
    post.comments.push(newComment);
    const updatedPost = await postModel.findByIdAndUpdate(id, post, {
      new: true,
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const { postId } = req.body;
  try {
    const foundPost = await postModel.findById(postId);
    foundPost.comments = foundPost.comments.filter(
      (com) => String(com._id) !== String(commentId)
    );
    const post = await postModel.findByIdAndUpdate(postId, foundPost, {
      new: true,
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// export const likePost = async (req, res) => {
//       const likedPost = await postModel.findOneAndUpdate({_id:req.params.id}, {$inc:{ likeCount:1  }}, { new: true });
//       res.status(200).json(likedPost);
//    } catch (error) {
//       res.status(404).json({message: error.message})
//    }
// }
