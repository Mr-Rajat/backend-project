import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(404, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong and playlist not created")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!userId?.trim()) {
        throw new ApiError(404, "UserId is required")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId")
    }

    const playlist = await Playlist.find(
        { owner: new mongoose.Types.ObjectId(userId) }
    ).populate("video")

    if (!playlist) {
        throw new ApiError(404, "No playlist exists")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!playlistId?.trim()) {
        throw new ApiError(404, "Playlist Id is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId).populate("video")

    if (!playlist) {
        throw new ApiError(404, "No playlist exists with this id")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId?.trim() || !videoId?.trim()) {
        throw new ApiError(400, "Id is required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No Playlist Found")
    }

    const isVideoExists = await playlist.video.includes(videoId)

    if (isVideoExists) {
        throw new ApiError(400, "Video already exists in the playlist")
    }

    // push the video in the array
    playlist.video.push(videoId)

    const updatedPlaylist = await playlist.save()

    res.status(200).json(
        200, updatedPlaylist, "Video Added in the playlist successfully"
    )


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!playlistId?.trim() || !videoId?.trim()) {
        throw new ApiError(404, "id not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "No playlist exists")
    }

    const isVideoExists = playlist.video.includes(videoId)

    if (!isVideoExists) {
        throw new ApiError(404, "Video not found in the playlist")
    }

    // getting index of video in the array

    const videoIndex = playlist.video.indexOf(videoId)
    // just adding extra check ... review when data available
    if (videoIndex === -1) {
        throw new ApiError(404, "video not found in the playlist")
    }

    // remove the video from the playlist array
    playlist.video.splice(videoIndex, 1)

    const updatedPlaylist = await playlist.save()

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video removed successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(404, "No playlist id found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (String(playlist.owner) !== String(req.user?._id)) {
        throw new ApiError(401, "Not an owner of this playlist")
    }

    const deletePlaylist = await playlist.deleteOne()

    if (deletePlaylist.deletedCount === 1) {
        res.status(200).json(
            new ApiResponse(200, deletePlaylist, "Playlist removed successfully")
        )
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(404, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (String(playlist.owner) != String(req.user?._id)) {
        throw new ApiError(401, "Not an owner of playlist")
    }

    playlist.name = name
    playlist.description = description

    const updatedPlaylist = await playlist.save()

    if (!updatedPlaylist) {

        throw new ApiError(500, "Playlist not updated due to some error")
    }

    res.status(200).json(
        new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}