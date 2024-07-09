import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// we will take a file using file system then we will use multer to store it in local server and then we will store it on cloudinary.
// we store it once on local because what if we need to reattempt storing it on cloud.

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    //localFilePath -> on our server.
    if (localFilePath) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      fs.unlinkSync(localFilePath);
      return response;
    } else return null;
  } catch (error) {
    fs.unlinkSync(localFilePath); // here, we will deleting/unlinking our locally saved file as the operation has failed.
    //By 'Sync' it implies -> that first we delete the file then we proceed to anything else
  }
};

export default uploadOnCloudinary;
