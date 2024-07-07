import mongoose, { Schema } from "mongoose"; // we had put schema after mongoose because schema is coming from it.
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //user will not give us.
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false, // we dont need required field here as we are providing default value already.
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
mongoose - aggregate - paginate - v2;

// IMPORTANT!!
// We use the name of the Schema file for using middlewares
videoSchema.plugin(mongooseAggregatePaginate); // this npm package came later to node, so we add it as a plugin. 

export const Video = mongoose.model("Video", videoSchema);
