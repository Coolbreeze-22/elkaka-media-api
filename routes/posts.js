import express from "express";
import { getPosts, getPostById, getPostsBySearch, createPost, updatePost, deletePost, likePost, commentPost, deleteComment } from '../controllers/controllerPosts.js';
import authMiddle from "../middleware/authMiddle.js";

const postRouter = express.Router();

postRouter.get('/', getPosts);
postRouter.get('/id/:id', getPostById);
postRouter.get('/search', getPostsBySearch);
postRouter.post('/', authMiddle, createPost);
postRouter.patch('/:id', updatePost);
postRouter.delete('/:id', deletePost);
postRouter.patch('/:id/likePost', authMiddle, likePost);
postRouter.patch('/:id/commentPost', commentPost);
postRouter.patch('/comments/:id', deleteComment);

export default postRouter;



// postRouter.get('/', getPosts);
// postRouter.post('/', createPost);
// postRouter.patch('/:id', updatePost);
// postRouter.delete('/:id', deletePost);
// postRouter.patch('/:id/likePost', likePost);
