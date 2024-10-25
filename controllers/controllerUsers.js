import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const allUsers = await userModel.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(404).json({ message: "Incorrect Password." });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signUp = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exist." });
    if (password !== confirmPassword)
      return res.status(404).json({ message: "Passwords does not match." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    const token = jwt.sign({ email: newUser.email, id: newUser._id }, "test", {
      expiresIn: "1hr",
    });

    res.status(200).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);

    if (sender.isOwner && !user.isOwner) {
      user.isAdmin = true;
      user.level = 1;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else if (
      sender.isOwner &&
      user.isOwner &&
      (req.params.id === req.userId || sender.level > user.level)
    ) {
      user.isAdmin = true;
      user.level = 1;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > 1
    ) {
      user.isAdmin = true;
      user.level = 1;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "Unauthorized to make admin" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);
    //  dont use sender._id or user._id. they are both string objects. Instead, convert them to string e.g String(sender._id)
    if (
      (sender.isOwner && !user.isOwner) ||
      (sender.isAdmin && req.params.id === req.userId)
    ) {
      user.isAdmin = false;
      user.level = 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else if (
      sender.isOwner &&
      user.isOwner &&
      (req.params.id === req.userId || sender.level > user.level)
    ) {
      user.isAdmin = false;
      user.level = 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level
    ) {
      user.isAdmin = false;
      user.level = 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "Unauthorized to remove admin" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const levels = async (req, res) => {
  const item = req.body;
  const level = item.newLevel;
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);

    if (
      sender.isOwner &&
      !user.isOwner &&
      Number(level) > 0 &&
      Number(level) < 4
    ) {
      user.isAdmin = await true;
      user.level = user.isAdmin ? Number(level) : 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
      user.isAdmin = await true;
    } else if (
      sender.isOwner &&
      user.isOwner &&
      (req.params.id === req.userId || sender.level > user.level) &&
      Number(level) > 0 &&
      Number(level) < 4
    ) {
      user.level = user.isAdmin ? Number(level) : 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level &&
      sender.level > Number(level) &&
      Number(level) > 0 &&
      Number(level) < 4
    ) {
      user.level = user.isAdmin ? Number(level) : 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        user,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "Unauthorized to update level" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);
    //  dont try to use sender._id or user._id

    if (req.userId === req.params.id) {
      await userModel.findByIdAndRemove(user._id);
      res.status(200).json("Your account has been deleted successfully");
    } else if (sender.isOwner && !user.isOwner) {
      await userModel.findByIdAndRemove(user._id);
      res.status(200).json("User deleted successfully");
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level &&
      sender.level > 1
    ) {
      await userModel.findByIdAndRemove(user._id);
      res.status(200).json("User deleted successfully");
    } else {
      res.status(403).json({ message: "Unauthorized to delete account" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
