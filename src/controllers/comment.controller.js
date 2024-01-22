import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(404, 'No video Id found')
    }

    const videoComments = await Comment.find(
        {
            video: mongoose.Types.ObjectId(videoId)
        }
    ).skip((parseInt(page) - 1) * parseInt(limit)) // Skip documents based on the current page
        .limit(parseInt(limit)) // Limit the number of documents per page

    if (!videoComments) {
        throw new ApiError(404, "No comment exists")
    }

    res.status(200).json(
        new ApiResponse(200, videoComments, "Comments fetched successfully")
    )



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { content } = req.body

    if (!videoId) {
        throw new ApiError(404, "no video id found")
    }

    if (!content || !content?.trim()) {
        throw new ApiError(404, 'Content is required')
    }

    const comment = await Comment.create({
        content,
        video: mongoose.Types.ObjectId(videoId),
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Server Error while creating the comment")
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params

    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "comment id is required")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "comment content is required")
    }

    const comment = await Tweet.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "No comment exists with this id")
    }

    if (String(comment.owner) !== String(req.user?._id)) {
        throw new ApiError(401, "You are not authorized to perform this action")
    }

    comment.content = content

    const updatedComment = await comment.save()

    if (!updateComment) {
        throw new ApiError(400, "comment not updated")
    }

    res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "comment id is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError("No comment exists with this id")
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized owner of comment")
    }

    const deleteComment = await comment.deleteOne()

    if (deleteComment.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, deleteComment, "comment deleted successful")
        )
    }
    else {
        throw new ApiError(400, "comment not found or not deleted")
    }

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
