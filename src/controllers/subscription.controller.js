import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // TODO: toggle subscription
    if (!channelId?.trim()) {
        throw new ApiError(404, "Channel Id not found")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(422, 'Invalid objectid')
    }

    const toggleSubscription = await Subscription.findOne({
        $and: [
            { channel: new mongoose.Types.ObjectId(channelId) },
            { subscriber: req.user?._id }
        ]
    })

    if (!toggleSubscription) {

        const subscribedToggle = await Subscription.create({
            subscriber: req.user?._id,
            channel: new mongoose.Types.ObjectId(channelId)
        })

        return res.status(200).json(
            new ApiResponse(200, subscribedToggle, "Channel subscribed successfully")
        )
    }

    const toggleUnsubscribe = await toggleSubscription.deleteOne()

    if (toggleUnsubscribe.deletedCount === 1) {
        return res.status(200).json(
            new ApiResponse(200, toggleUnsubscribe, "Channel Unsubscribed successfully")
        )
    } else {
        throw new ApiError(404, "No subscription found or already unsubscribed")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId?.trim()) {
        throw new ApiError(404, "channel id is required")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channel id")
    }

    const channelSubscriber = await Subscription.find({
        channel: new mongoose.Types.ObjectId(channelId)
    }).populate("subscriber")

    if (!channelSubscriber) {
        throw new ApiError(404, "No user subscribe this channel.")
    }

    res.status(200).json(
        new ApiResponse(200, channelSubscriber, "channel subscriber list fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId?.trim()) {
        throw new ApiError(404, "Subscriber id is required")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Invalid subscriber id")
    }

    const subscribedChannelList = await Subscription.find(
        {
            subscriber: new mongoose.Types.ObjectId(subscriberId),
        }
    ).populate("channel")

    if (!subscribedChannelList) {
        throw new ApiError(404, "No channel subscribed")
    }

    res.status(200).json(
        new ApiResponse(200, subscribedChannelList, "Channel subscribed fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}