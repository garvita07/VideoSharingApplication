import mongoose, { Schema } from "mongoose";
import JsonWebToken from "jsonwebtoken";
import bcrypt from "bcrypt";

// A database schema is a logical representation of data that shows how the data in a database should be stored logically.
// It shows how the data is organized and the relationship between the tables.
// It is basically the dbdiagrams that we design.
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true, //Indexes support efficient execution of queries in MongoDB. Without indexes, MongoDB must scan every document in a collection to return query results.
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      // where you define the array is crucial.
      // here, it means that the watchhistory is an array of objects. And we are defining the object here. What the individual array will have.
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// We use name of the Schema to use middlewares and hooks(same thing). <--IMPORTANT
userSchema.pre("save", async function (next) {
  //we dont use arrow functions because we need the context ie, this.
  if (this.isModified("password")) {
    console.log("YOOO");
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
  }
  next();
});

// this schema file now has access to a bunch of objects -> methods is one of them. We can add any new method as a property to this objects.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // password is the current entry from the user and this.password is what was stored in db.
};

userSchema.methods.generateAccessToken = async function () {
  return await JsonWebToken.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return await JsonWebToken.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
