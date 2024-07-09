import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `DB connected!\nThe connection is hosted at ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("ERROR in db connection.", error);
    throw error;
  }
};

export default connectDB;

// we connected the DB here.
