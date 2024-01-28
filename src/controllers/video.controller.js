import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"


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

    const localThumbnail = req.files?.thumbnail[0]?.path

    if (!localThumbnail) {
        throw new ApiError(404, "No Thumbnail file found")
    }

    const videoFile = await uploadOnCloudinary(localVideoFilePath)
    const thumbnailImage = await uploadOnCloudinary(localThumbnail)

    // console.log("video file: ", videoFile)
    /*
     video file:  {
        asset_id: '64d6d4c32694fb7a00b4556947747db7',
        public_id: 'jzlg6u54oululzts6ydd',
        version: 1706459738,
        version_id: '18769967cbd01a797bd23e65f65f47ab',
        signature: '4a21bb5339f185ced6f466755b579be0b5c345e4',
        width: 1080,
        height: 1920,
        format: 'mp4',
        resource_type: 'video',
        created_at: '2024-01-28T16:35:38Z',
        tags: [],
        pages: 0,
        bytes: 431255,
        type: 'upload',
        etag: '70d19fe36d21bad6a3aa818699f7ab9c',
        placeholder: false,
        url: 'http://res.cloudinary.com/rajatdev/video/upload/v1706459738/jzlg6u54oululzts6ydd.mp4',
        secure_url: 'https://res.cloudinary.com/rajatdev/video/upload/v1706459738/jzlg6u54oululzts6ydd.mp4',
        playback_url: 'https://res.cloudinary.com/rajatdev/video/upload/sp_auto/v1706459738/jzlg6u54oululzts6ydd.m3u8',
        folder: '',
        audio: {
            codec: 'aac',
            bit_rate: '127999',
            frequency: 44100,
            channels: 2,
            channel_layout: 'stereo'
        },
        video: {
            pix_format: 'yuv420p',
            codec: 'vp9',
            level: -99,
            profile: 'Profile 0',
            bit_rate: '1300779',
            time_base: '1/29187'
        },
        is_audio: false,
        frame_rate: 29.187,
        bit_rate: 1401713,
        duration: 2.461301,
        rotation: 0,
        original_filename: 'video',
        nb_frames: 70,
        api_key: '417229472897637'
        }
    */

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

    const video = await Video.findById(videoId).populate({
        path: "owner",
        select: "fullname"
        // getting only fullname of owner
    })

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

    const { title, description } = req.body

    if (!videoId?.trim()) {
        throw new ApiError(400, "video id is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(404, "title and description are required field")
    }

    const videoExists = await Video.findById(videoId)

    if (!videoExists) {
        throw new ApiError(404, "video not found")
    }

    if (String(videoExists.owner) !== String(req.user?._id)) {
        throw new ApiError(401, "Not an owner of this video")
    }


    const localThumbnailPath = req.file?.path

    console.log("local thumbnail,", localThumbnailPath)

    if (!localThumbnailPath) {
        throw new ApiError(404, "Thumbnail file not found")
    }

    const thumbnailImage = await uploadOnCloudinary(localThumbnailPath)

    if (!thumbnailImage?.url) {
        throw new ApiError(404, "Thumbnail file not found")
    }

    // remove from cloudinary
    const removeThumbnailImage = await deleteOnCloudinary(videoExists?.thumbnail)

    console.log("Remove file: ", removeThumbnailImage)
    // Remove file:  { result: 'ok' }

    // updating fields
    videoExists.title = title
    videoExists.description = description
    videoExists.thumbnail = thumbnailImage?.url

    await videoExists.save()

    const updateVideo = await Video.findById(videoExists?._id).populate({
        path: "owner",
        select: "-password"
    });


    if (!updateVideo) {
        throw new ApiError(404, "no video found")
    }
    return res.status(200).json(
        new ApiResponse(200, updateVideo, "video data updated succesfully")
    )


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

    const oldVideo = videoExist.videoFile
    const oldThumbnail = videoExist.thumbnail

    const removedVideo = await videoExist.deleteOne()

    if (removedVideo.deletedCount === 1) {
        // removing video and thumbnail from cloudinary, not waiting for it to finished because we don't need response her
        deleteOnCloudinary(oldVideo)
        deleteOnCloudinary(oldThumbnail)

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

    // console.log("result: ", updatedPublishStatus)

    if (!updatedPublishStatus) {
        throw new ApiError(500, "something went wrong while updating status")
    }

    const newPublishStatus = await Video.findById(togglePublishStatus._id)

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