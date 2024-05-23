import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error while connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
