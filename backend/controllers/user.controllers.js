import { Notification } from "../models/notification.models.js";
import { User } from "../models/user.models.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToModify = await User.findById(id);

    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      res.status(400).json({ error: "You can't follow yourself" });
    }

    if (!(userToModify || currentUser)) {
      res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // unfollow the user

      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      //pulling the current user in the followers array of the userToModify

      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // pulling the userToModify in the following array of the currentUser

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // follow the user

      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      //pushing the current user in the followers array of the userToModify

      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // pushing the userToModify in the following array of the currentUser

      //send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser controller: ", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const user = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filteredUsers = user.filter(
      (user) =>
        !usersFollowedByMe.following.includes(user._id) && user._id !== userId
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers controller: ", error.message);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;

    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;


    let user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    if (
      (!currentPassword && newPassword) ||
      (newPassword && !currentPassword)
    ) {
      res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        res.status(400).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
      }

      if (currentPassword === newPassword) {
        res.status(400).json({ error: "New password must be different" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // TODO : UPLOAD iMAGES TO CLOUDINARY (profileImg, coverImg) HAVE TO BE SOLVE THIS CODE LATER
    if (profileImg) {

      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);

      user.profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {

      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);

      user.coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);

  } catch (error) {
    console.log("Error in UpdateUser controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
