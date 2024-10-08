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
  // console.log(req.body)
  try {
    const existingUser = await userModel.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(404).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signUp = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  // console.log(req.body)
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
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);

    if (sender.isOwner && !user.isOwner) {
      user.isAdmin = true;
      user.level = 1;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > 1
    ) {
      user.isAdmin = true;
      user.level = 1;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    }

    else if (sender.isOwner && req.userId === req.params.id) {
      user.isAdmin = true;
      user.level = 3;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    }
    // just incase som1 is owner without admin & level, he can make himself admin and level 3
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);

    if (sender.isOwner && !user.isOwner) {
      user.isAdmin = false;
      user.level = 0;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level
    ) {
      user.isAdmin = false;
      user.level = 0;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const levels = async (req, res) => {
  const item = req.body;
  const level = item.newLevel;

  try {
    const user = await userModel.findById(req.params.id);
    const sender = await userModel.findById(req.userId);

    if (sender.isOwner && !user.isOwner) {
      user.isAdmin = await Number(level) > 0 && Number(level) < 4 ? true : false;
      user.level = user.isAdmin ? Number(level) : 0;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.id, user, { new: true, });
      res.status(200).json(updatedUser);
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level &&
      sender.level > Number(level)
    ) {
      user.isAdmin =
        (await Number(level)) > 0 && Number(level) < 4 ? true : false;
      user.level = user.isAdmin ? Number(level) : 0;
      const updatedUser = await userModel.findByIdAndUpdate( req.params.id, user, { new: true, } );
      res.status(200).json(updatedUser);
    } else {
      res.status(200).json(user);
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
      res.status(200).json("Deleted Successfully");
    } else if (sender.isOwner && !user.isOwner) {
      await userModel.findByIdAndRemove(user._id);
      res.status(200).json("Owner Deleted User Successfully");
    } else if (
      !user.isOwner &&
      !sender.isOwner &&
      sender.isAdmin &&
      sender.level > user.level &&
      sender.level > 1
    ) {
      await userModel.findByIdAndRemove(user._id);
      res.status(200).json("Higher Deleted Lower Successfully");
    } else {
      res.status(200).json("Unauthorized");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
