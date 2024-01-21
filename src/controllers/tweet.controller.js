import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // Steps: required => user => tweet content, Owner Id  ( userId)

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "content is required")
    }

    try {
        const tweet = await Tweet.create({
            content,
            owner: req.user._id
        })

        res.status(200).json(
            new ApiResponse(200, tweet, "Tweet created successfully")
        )

    }
    catch (error) {
        throw new ApiError(500, "Something went wrong")
    }

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;
    // userId.stringify

    // console.log("UserId: ", req.user._id);
    // console.log("Params: ", userId, typeof (userId));

    if (!userId) {
        throw new ApiError(400, "user id required user id");
    }
    try {

        const isValideId = await isValidObjectId(userId)
        // console.log(response, "status")
        if (!isValideId) {
            throw new ApiError(400, "Invalid User Id")
        }

        if (userId !== req.user?._id.toString()) {
            throw new ApiError(400, "userId does not match")
        }

        const user = await User.findById({
            _id: new mongoose.Types.ObjectId(userId)
        })

        if (!user) {
            throw new ApiError(404, "No such user found.")
        }

        // console.log(req.user._id)

        const tweets = await Tweet.find({
            // owner: req.user._id
            owner: new mongoose.Types.ObjectId(userId)
        })

        if (!tweets) {
            throw new ApiError(404, "No tweet exists with this userId")
        }
        res.status(200).json(
            new ApiResponse(200, tweets, "Tweets fetched successfully")
        )

    }
    catch (error) {
        throw new ApiError(500, error.message)
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body

    if (!tweetId || !content?.trim()) {
        throw new ApiError(400, 'tweet id and content is required')
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    if (String(tweet.owner) != String(req.user?._id)) {
        throw new ApiError(401, "not an owner of tweet")
    }

    tweet.content = content

    const updatedTweet = await tweet.save()

    res.status(200)
        .json(
            new ApiResponse(200, updatedTweet, "Tweet updated successfully")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId?.trim()) {
        throw new ApiError(400, "tweet ID is missing")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "tweet not found")
    }

    if (String(tweet.owner) != String(req.user?._id)) {
        throw new ApiError(401, "not an owner of tweet")
    }

    const result = await tweet.deleteOne();

    console.log(result)

    if (result.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, result, "Tweet deleted successful")
        )
    }
    else {
        throw new ApiError(400, "Tweet not found or not deleted")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}