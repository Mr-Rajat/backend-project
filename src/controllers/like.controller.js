import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId?.trim()) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid Video Id')
    }

    const videoLike = await Like.findOne({
        $and: [
            { "video": videoId },
            { "likedBy": req.user._id }
        ]
    })

    if (!videoLike) {
        //create a new like for the video by user and save it to db
        const newVideoLike = await Like.create({
            "video": videoId,
            "likedBy": req.user._id
        })

        res.status(200).json(
            new ApiResponse(200, newVideoLike, "video like by user successfully")
        )
    }

    const removeVideoLike = await videoLike.deleteOne()

    if (removeVideoLike.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, null, "User has removed his like of this video successfully")
        )
    } else {
        throw new ApiError(500, "something went wrong while removing like from video")
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId?.trim()) {
        throw new ApiError(400, "Comment Id is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const toggleComment = await Like.findOne({
        $and: [
            { comment: commentId },
            { likedBy: req.user?._id }
        ]
    })

    if (!toggleComment) {
        const newCommentLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        res.status(200).json(
            new ApiResponse(200, newCommentLike, "Comment like added successfully")
        )
    }

    const removeCommentLike = await toggleComment.deleteOne()

    if (removeCommentLike.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, {}, "Comment unliked successfully")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    // console.log("TweetId: ", tweetId, "typeof TweetId: ", typeof(tweetId))
    // console.log("UserId ", req.user._id, "typeof: ", typeof(req.user._id))
    // on console:=> UserId  new ObjectId('65ad43dd713d6b2f0a638c75') typeof:  object

    if (!tweetId?.trim()) {
        throw new ApiError(400, "Tweet Id is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const toggleTweetLike = await Like.findOne({
        $and: [
            { tweet: tweetId },
            { likedBy: req.user._id }
        ]
    })

    console.log("tweet", toggleTweetLike)

    if (!toggleTweetLike) {
        const addTweetLike = await Like.create({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200, addTweetLike, "Tweet liked successfully")
        )
    }

    const removeTweetLike = await toggleTweetLike.deleteOne()

    if (removeTweetLike.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, removeTweetLike, "Tweet Like removed successfully")
        )
    } else {
        res.status(500).json(
            500, removeTweetLike, "Something went wrong, could not remove tweet like"
        )
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: {
            $exists: true
        }
    }).populate("video").populate("owner")

    if(!likedVideos.length){
        throw new ApiError(404, "no liked videos found")
    }

    res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfullyF")
    )


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}