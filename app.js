import express from "express";
import { dotenv } from "dotenv";
dotenv.configure();
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // to allow cookies with credentials to access our domain.
  })
);

app.use(express.json({ limit: "16kb" })); // to not have unlimited data coming in json form.

app.use(express.urlencoded({extended : true, limit :'16kb' }))//urlencoder -> convrts the special characters present in the URL into either %20 or +.
// extended : true -> it allows us to send an object inside an object.

app.use(expres.static("public")); //where to store files in our server.

//connectDB() -> database is connected.
connectDB
  .then(
    app.listen(process.env.PORT || 3000, () => {
      //app.listen -> server is setup for the application
      console.log(`PORT: ${process.env.PORT}`);
    })
  )
  .catch((error) => {
    console.log(error);
  });
