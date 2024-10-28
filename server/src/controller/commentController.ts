import { Request, Response } from 'express';
const asyncHandler = require("express-async-handler")
const User = require('../models/user');
const Comment = require('../models/comment')

import EventModel, { IEvent } from '~/models/event';

const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId } = req?.user;
    const { eid } = req?.params;

    const user = await User?.findById(userId)
    const event = await EventModel.findById(eid)?.populate('created_by')

    if (!user || !event) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User or event not found',
        });
    }

    const { comment } = req.body

    if (!comment) {
        return res.status(400).json({
            status: false,
            code: 400,
            message: 'Comment is required',
        });
    }

    const response = await Comment.create({
        userId: user._id,
        comment,
        eventId: event._id,
        parentComment: req.body.parentComment || null,
    });

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: 'Create comment successfully',
        result: response
    })
})


const getListCommentByIdEvent = asyncHandler(async (req: Request, res: Response) => {
    const {eid} = req.params
    const event = await EventModel.findById(eid)?.populate('created_by');
    if(!event){
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'Event not found',
        });
    }
    const response = await Comment.find({ eventId: eid })
    .populate('userId')
    .populate('eventId');

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: 'Fetched comments successfully',
        result: response
    })
})

export {
    createComment,
    getListCommentByIdEvent
}