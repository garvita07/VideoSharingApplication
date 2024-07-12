import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // to allow cookies with credentials to access our domain.
  })
);

app.use(express.json({
  // limit: "16kb"
})); // to not have unlimited data coming in json form.

app.use(express.urlencoded({
  extended: true,
  // limit: '16kb'
}))//urlencoder -> converts the special characters present in the URL into either %20 or +.
// extended : true -> it allows us to send an object inside an object.

app.use(express.static("public")); //where to store files in our server.

app.use(cookieParser());

//import Routes 
import userRouter from "./src/routes/user.routes.js";

//config:
app.use("/api/v1/users", userRouter);



export { app }; 
// we will use this to configure middleware, provide routes etc.

