import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getFollowingPosts,
  getLikedPosts,
  getPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/all", protectRoute, getPosts);

router.get("/following", protectRoute, getFollowingPosts);

router.get("/likes/:id", protectRoute, getLikedPosts);

router.get("/user/:username", protectRoute, getUserPosts);

router.post("/create", protectRoute, createPost);

router.delete("/:id", protectRoute, deletePost);

router.post("/comment/:id", protectRoute, commentOnPost);

router.post("/like/:id", protectRoute, likeUnlikePost);

// router.post("/update", protectRoute, updatePost);

export default router;
