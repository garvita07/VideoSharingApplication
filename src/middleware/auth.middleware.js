import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("authorization")?.replace("bearer ", "");

  if (!token) {
    throw new apiError(401, "unauthorized access.");
  }

  const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const userFound = await User.findById(decoded?._id).select(
    "-password -refreshtoken"
  );
  if (!userFound) {
    throw new apiError(401, "Invalid Access Token");
  }
  req.user = userFound;
  next();
});

export { verifyJWT };
