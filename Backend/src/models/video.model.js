import mongoose, {Schema} from "mongoose";
import { User } from "./user.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //from cloudinary
            required: true
        },
        thumbnail: {
            type: String, //from cloudinary
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true 
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);