import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // total videos
    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {
                    $sum: 1
                },
                publishedVideos: {
                    $push: "$_id"
                },
                videoViews: {
                    $push: "$views"
                }
            },
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                publishedVideos: 1,
                videoViews: 1
                
            }
        }

    ])

    // total subscribers
    const totalSubcribers = await Subscription.aggregate([
        {
            $match: {
                channel: req.user?._id
            }
        },
        {
            $count: "totalSubscribers"
        }

    ])

    // total video likes
    const totalVideoLikes = await Like.aggregate([
        {
            $match: {
                video: {
                    $in: totalVideos[0].publishedVideos
                }
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    // total views
    const videosViews = totalVideos[0].videoViews

    const totalViews = videosViews.reduce((acc, curr) =>  acc + curr)
    // console.log("totalview: ", totalViews, typeof(totalViews))

    const stats = {
        totalSubscribers : totalSubcribers[0]?.totalSubscribers || 0,
        totalVideoLikes : totalVideoLikes[0]?.totalLikes || 0,
        totalVideos : totalVideos[0]?.totalVideos || 0,
        totalVideosView : totalViews


    }
    // const stats = {
    //     totalSubscribers : totalSubcribers[0],
    //     totalVideoLikes : totalVideoLikes[0],
    //     totalVideos : totalVideos[0]


    // }

    // console.log("Stats: ", stats)

    // console.log("Array value: ", totalVideos[0].publishedVideos)
    // console.log("Total Subscribers: ", totalSubcribers)
    // console.log("Total videoLikes: ", totalVideoLikes)

    // console.log("totalVideos: ", totalVideos)
    return res.status(200).send({
        "msg": "data fetched",
        "data": stats
    })
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelVideos = await Video.find({
        owner: req.user?._id
    })
        .sort("-createdAt")
        .populate({
            path: "owner",
            select: "-password -refreshToken -watchHistory"
        })

    if (!channelVideos) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200).json(
        new ApiResponse(200, channelVideos, "Channels videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}