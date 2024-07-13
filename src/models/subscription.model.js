import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = Schema(
  {
    //represents the channels that are subscribed by the user.
    channel: [
      //array of users
      {
        type: Schema.Types.ObjectId, //sub entity defined in {}.
        ref: "User",
      },
    ],
    //represents the users who have subscribed to him.
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Subscription = new mongoose.model("Subscription", subscriptionSchema);
