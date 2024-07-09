import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./src/db/index.js";
import { app } from './app.js';

//connectDB() -> database is connected.
connectDB()
  .then(
    app.listen(process.env.PORT || 3000, () => {
      //app.listen -> server is setup for the application
      console.log(`PORT: ${process.env.PORT}`);
    })
  )
  .catch((error) => {
    console.log(error);
  });

// here we connect to the server using express after the db is successfully connected.


