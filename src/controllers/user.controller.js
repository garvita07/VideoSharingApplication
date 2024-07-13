import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  //TAKING VALUES FROM CLIENT:
  const { fullName, username, email, password } = req.body;

  //VALIDATION:
  if (
    [fullName, username, email, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required.");
  }

  //CHECK IF USER EXISTS:
  const userExists = await User.findOne({
    //we pass queries in {}. Here, we are checking the OR condition using 'or' operator.
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new apiError(
      400,
      " A user with this email or username already exists in the system."
    );
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

const loginUser = asyncHandler(async (req, res) => {
  //take creds from client
  const { email, username, password } = req.body;
  //validation
  if (
    [email, username, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new apiError(404, " Please enter all details to proceed.");
  }
  //check user exists
  const userExists = await User.findOne({
    //this will only have the properties that were their in the db at that time. So any changes and additions will not be there.
    $or: [{ username }, { email }],
  });
  if (!userExists) {
    throw new apiError(404, "No user with the given credentials exists.");
  }

  //check password correct
  const isPasswordValid = await userExists.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(409, "Password entered is wrong.");
  }

  //generate access and refresh token
  const accessToken = await userExists.generateAccessToken();
  //const refreshToken = User.generateRefreshToken();

  const refreshToken = await userExists.generateRefreshToken();

  //add refresh token to the document
  userExists.refreshToken = refreshToken;

  //save in db
  await userExists.save({ validateBeforeSave: false }); //all the fields that have not been provided they will not be saved again, only what is provided will be saved.

  const LoggedInUser = await User.findById(userExists._id).select(
    "-password -refreshToken"
  );
  //for cookies
  const options = {
    httpOnly: true,
    secure: true,
  }; // only server can modify the cookies with this.

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        201,
        { LoggedInUser, refreshToken, accessToken },
        "user logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const ourUser = await User.findById(req.user._id);

  ourUser.refreshToken = undefined;
  ourUser.accessToken = undefined;

  await ourUser.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out successfully."));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (
    [oldPassword, newPassword, confirmNewPassword].some(
      (fields) => fields?.trim === ""
    )
  ) {
    throw new apiError(404, " Please fill all fields to proceed.");
  }

  if (newPassword != confirmNewPassword) {
    throw new apiError(401, " Old and New Password don't match.");
  }

  if (oldPassword == newPassword) {
    throw new apiError(401, " New password can't be same as old password");
  }

  const passwordStatus = await user.isPasswordCorrect(oldPassword);
  if (!passwordStatus) {
    throw new apiError(404, "Unauthorized request: Password entered is wrong");
  }

  user.password = newPassword;

  const newUserCreds = await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new apiResponse(200, newUserCreds, "Password Changed Successfully."));
});

const requestAcccessToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.header("authorization")?.replace("bearer ", "");

  // jwt.verify is used to authenticate the token, if it is a valid token and that it has not been tampered with.
  // once a token has been authenticated it will provide all the parameters for that user.
  const isTokenValid = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  if (!isTokenValid) {
    throw new apiError(404, "unauthorized request.");
  }

  const user = await User.findById(isTokenValid._id);

  if (token != user?.refreshToken) {
    // we need to check this ourselves.
    throw new apiError(404, "RefreshToken is invalid.");
  }

  const accessToken = await user.generateAccessToken();

  const refreshToken = await user.generateRefreshToken(); //if we need refreshToken only then should we create one.

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(500)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(404, {}, " New access token created."));
});

// const subcribers = asyncHandler((req, res) => {
//   const subscriber = req.users._id;
//   const channel = req.body._id;
// });
// const userProfile = asyncHandler((req, res) => {
//   req.user._id;
// });

const getCurrentUser = asyncHandler((req, res) => {
  res.status(200).json(new apiResponse(200, req.user, "user details fetched."));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (
    [fullName, email].some((fields) => {
      fields?.trim() === "";
    })
  ) {
    throw new apiError("All fields are required.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let avatar = null;
  let coverImage = null;

  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  } else {
    throw new apiError(
      500,
      error.message || " Failed to upload the Avatar to the cloud."
    );
  }

  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  } else {
    throw new apiError(
      500,
      error.message || " Failed to upload the Cover Image to the cloud."
    );
  }

  const userUpdated = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
        avatar: avatar?.url || req.user.avatar, //we cant already declare a avatar variable with the current url of it and then here if the new avatar doesnt come,
        //it will not automatically be update with the previous one.We will get undefined value.
        coverImage: coverImage?.url || req.user.coverImage,
      },
    },
    {
      new: true,
    }
  );

  console.log(userUpdated);
  if (!userUpdated) {
    throw new apiError(500, "failed to update the user data.");
  }
  res
    .status(200)
    .json(
      new apiResponse(200, userUpdated, "user details updated successfully.")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  requestAcccessToken,
  getCurrentUser,
  updateProfile,
};
