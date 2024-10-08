import postModel from "../models/postModel.js";

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
    const { posts, currentPage, totalPages } = await getPostsByPage( page, isCreate );
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
    const titles = new RegExp(title, "i");
    if (title && !tags) {
      const posts = await postModel.find({ title: titles }).sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (tags && !title) {
      const posts = await postModel
        .find({ tags: { $in: tags.split(",") } })
        .sort({ _id: -1 });
      res.status(200).json({ posts, currentPage });
    } else if (title && tags) {
      const posts = await postModel
        .find({
          $or: [{ title: titles }, { tags: { $in: tags.split(",") } }],
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
  const newPost = { ...post, creator: req.userId };
  try {
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
    await postModel.findByIdAndRemove(req.params.id);
    res.status(200).json("Deleted Successfully");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
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
    const likedPost = await postModel.findByIdAndUpdate(req.params.id, post, { new: true });
    res.status(200).json(likedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  const comment = { ...value, creator: req.userId };

  try {
    const post = await postModel.findById(id);
    // post.comments = [...post.comments, value] OR
    post.comments.push(comment);
    const updatedPost = await postModel.findByIdAndUpdate(id, post, { new: true, });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const cId = req.params.id;
  const { pId } = req.body;
  // console.log(typeof req.body)
  try {
    const foundPost = await postModel.findById(pId);
    foundPost.comments = foundPost.comments.filter((com) => com.id !== String(cId));
    const post = await postModel.findByIdAndUpdate(pId, foundPost, { new: true });
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


// the below code is same with the above, just that some logics were added.
// export const likePost = async (req, res) => {
//    try {
//       const likedPost = await postModel.findByIdAndUpdate(req.params.id, {likeCount: likeCount + 1}, { new: true });
//       res.status(200).json(likedPost);
//    } catch (error) {
//       res.status(404).json({message: error.message})
//    }
// }

// export const likePost = async (req, res) => {
//       const likedPost = await postModel.findOneAndUpdate({_id:req.params.id}, {$inc:{ likeCount:1  }}, { new: true });
//       res.status(200).json(likedPost);
//    } catch (error) {
//       res.status(404).json({message: error.message})
//    }
// }


