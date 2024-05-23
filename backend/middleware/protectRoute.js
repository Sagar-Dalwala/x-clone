import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      // Send response and return immediately
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Send response and return immediately
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      // Send response and return immediately
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);

    // Send response and return immediately
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
