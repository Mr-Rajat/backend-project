import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError('Please provide a valid title and description')
    }

    const localVideoFilePath = req.files?.videoFile[0]?.path

    if (!localVideoFilePath) {
        throw new ApiError(404, "No video file found")
    }

    const localThumbnail = req.file?.thumbnail[0]?.path

    if (!localThumbnail) {
        throw new ApiError(404, "No Thumbnail file found")
    }

    const videoFile = await uploadOnCloudinary(localVideoFilePath)
    const thumbnailImage = await uploadOnCloudinary(localThumbnail)

    if (!videoFile) {
        throw new ApiError(400, "video file is required")
    }

    if (!thumbnailImage) {
        throw new ApiError(400, "thumbnail image is required")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile?.url,
        thumbnail: thumbnailImage?.url,
        duration: videoFile?.duration,
        owner: req.user?._id
    })

    const addedVideo = await Video.findById(video?._id)

    if (!addedVideo) {
        throw new ApiError(500, "Something went wrong while publishing the video")
    }

    return res.status(200).json(
        new ApiResponse(200, addedVideo, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId?.trim()) {
        throw new ApiError(400, 'required video Id')
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId).populate("owner")

    if (!video) {
        throw new ApiError(404, "No video found with video Id")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId?.trim()) {
        throw new ApiError(404, "video id is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const videoExist = await Video.findById(videoId)

    if (!videoExist) {
        throw new ApiError(404, "No video found")
    }

    if (String(videoExist?.owner) !== String(req.user?._id)) {
        throw new ApiError(401, "No an owner of video")
    }

    const removedVideo = await videoExist.deleteOne()

    if (removedVideo.deletedCount === 1) {
        return res.status(200).json(
            new ApiResponse(200, removedVideo, "Video removed successfully")
        )
    }
    else {
        throw new ApiError(500, "something went wrong while deleting video")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId?.trim()) {
        throw new ApiError(400, "video is is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const togglePublishStatus = await Video.findById(videoId)

    if (!togglePublishStatus) {
        throw new ApiError(404, "Video not found")
    }

    if (String(togglePublishStatus.owner) !== String(req.user?._id)) {
        throw new ApiError(401, "Not owner of this video")
    }

    togglePublishStatus.isPublished = !(togglePublishStatus.isPublished)

    const updatedPublishStatus = await togglePublishStatus.save()

    if (!updatedPublishStatus) {
        throw new ApiError(500, "something went wrong while updating status")
    }

    const newPublishStatus = Video.findById(togglePublishStatus._id)

    if (!newPublishStatus) {
        throw new ApiError(404, "video not found")
    }
    return res.status(200).json(
        new ApiResponse(200, newPublishStatus, "Video Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}