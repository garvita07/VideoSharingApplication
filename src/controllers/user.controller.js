import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //TAKING VALUES FROM CLIENT:
  const { fullName, username, email, password } = req.body;

  //VALIDATION:
  if (
    [fullName, username, email, password].some((fields) => fields?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required.");
  }

  //CHECK IF USER EXISTS:
  const userExists = await User.findOne({
    //we pass queries in {}. Here, we are checking the OR condition using 'or' operator.
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new apiError(400, " A user with this email or username already exists in the system.")
  }

  //CHECK IMAGE:
  // 1) multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // 2) cloudinary
  let avatarResponse, coverImageResponse;
  if (avatarLocalPath) {
    avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  } else {
    throw new apiError(409, "Avatar is required.");
  }

  if (coverImageLocalPath) {
    coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);
  }

  if (!avatarResponse) {
    throw new apiError(500, "Cloudinary error");
  }

  //CREATE USER
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    avatar: avatarResponse.url,
    coverImage: coverImageResponse?.url || "",
    password,
  }); //refresh token and access token will be added to this and the password will be encrypted when it is going into the db.

  //CHECK IF ACTUALLY CREATED AND REMOVE PASSWORD ETC. FROM HERE TO SEND THIS TO CLIENT
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new apiError(500, "Interval server error while registering user.");
  }

  //SENDING RESPONSE:
  res
    .status(201)
    .json(new apiResponse(201, userCreated, "User registeration successful."));
});

export { registerUser };
