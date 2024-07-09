import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

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

export default userRouter;