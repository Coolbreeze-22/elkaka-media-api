import express from "express";
import { signUp, signIn, getUsers, getUserById, deleteUser, makeAdmin,levels, removeAdmin } from '../controllers/controllerUsers.js';
import authMiddle from "../middleware/authMiddle.js";

const userRouter = express.Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/signin', signIn);
userRouter.post('/signup', signUp);
userRouter.delete('/delete/:id', authMiddle, deleteUser);
userRouter.patch('/makeAdmin/:id',authMiddle, makeAdmin);
userRouter.patch('/levels/:id', authMiddle, levels);
userRouter.patch('/removeAdmin/:id', authMiddle, removeAdmin);

export default userRouter;