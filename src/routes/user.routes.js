import { Router } from "express";
import { loginUser, registerUser , logoutUser, changePassword} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router(); // we can also name it as -> router only. Its the more used convention.

userRouter.route("/register").post(
  // added middleware of multer in register route.
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/change-password").post(verifyJWT, changePassword);

export default userRouter;
