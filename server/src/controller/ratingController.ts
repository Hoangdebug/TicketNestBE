import { Request, Response } from 'express';
import EventModel from '~/models/event';
const asyncHandler = require("express-async-handler")
const User = require('../models/user');
const Rating = require('../models/rating')

const rateEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const {rating } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) {
        return res.status(404).json({
            status: false,
            code: 404,
            mes: 'Event not found',
        });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(401).json({
            status: false,
            code: 401,
            mes: 'User not found',
        });
    }

    const ratingExist = await Rating.findOne({ userId: user._id, eventId: event._id });
    if (ratingExist) {
        return res.status(400).json({
            status: false,
            code: 400,
            mes: 'Rating already exist',
        });
    }

    const newRating = await Rating.create({
        userId: user._id,
        eventId: event._id,
        rating: rating,
    })

    return res.status(200).json({
        status: newRating ? true : false,
        code: newRating ? 200 : 400,
        mes: newRating ? 'Create rating successfully' : 'Failed Create rating successfully',
    })
})


const listRate = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await EventModel.findById(eventId);
    if (!event) {
        return res.status(404).json({
            status: false,
            code: 404,
            mes: 'Event not found',
        });
    }

    const ratings = await Rating.find({ eventId: event._id })
    .populate('eventId')
    .populate('userId');

    return res.status(200).json({
        status: ratings ? true : false,
        code: ratings ? 200 : 400,
        mes: 'Fetched rate successfully',
        result: ratings
    })
})
export{
    rateEvent,
    listRate
};