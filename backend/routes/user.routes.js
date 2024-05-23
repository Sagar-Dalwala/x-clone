import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  UpdateUser,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);

router.get("/suggested", protectRoute,getSuggestedUsers);

router.post("/follow/:id", protectRoute, followUnfollowUser);

router.post("/update", protectRoute,UpdateUser);

export default router;
