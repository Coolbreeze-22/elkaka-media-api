import express from "express";
import authMiddle from "../middleware/authMiddle.js";
import userModel from "../models/userModel.js";

const migrationRouter = express.Router();

migrationRouter.patch("/", async (req, res) => {
  try {
    const allUsers = await userModel.find();
    for (let index = 0; index < allUsers.length; index++) {
      const user = allUsers[index];
      if (user.email === "agbokaka8@gmail.com") {
        user.isAdmin = true;
        user.level = 3;
        user.isOwner = true;
        await user.save();
      } else {
        user.isAdmin = false;
        user.level = 0;
        await user.save();
      }
    }
    res.status(200).json("user updated successfully");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }


  // try {
  //   const allUsers = await userModel.find();
  //   for (let user of allUsers) {
  //     if (user.email === "agbokaka8@gmail.com") {
  //       user.isAdmin = true;
  //       await user.save();
  //     } else {
  //       user.isAdmin = false;
  //       await user.save();
  //     }
  //     // console.log(user)
  //   }
  //   res.status(200).json("user updated successfully");
  // } catch (error) {
  //   res.status(404).json({ message: error.message });
  // }

  
});

export default migrationRouter;
