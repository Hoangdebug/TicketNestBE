/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { Request, Response } from 'express';
const asyncHandler = require("express-async-handler")
const User = require('../models/user');
const Comment = require('../models/comment')

import EventModel from '~/models/event';

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
    const { eid } = req.params
    const event = await EventModel.findById(eid)?.populate('created_by');
    if (!event) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'Event not found',
        });
    }
    const response = await Comment.find({ eventId: eid })
        .populate('userId', 'username images')

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: 'Fetched comments successfully',
        result: response
    })
})

const replyComment = asyncHandler(async (req: Request, res: Response) => {
    const { _id: userId } = req?.user
    const { eid, idComment } = req.params

    const user = await User?.findById(userId)
    const event = await EventModel.findById(eid)?.populate('created_by')
    const commentDetail = await Comment.findById(idComment)?.populate('parentComment')

    if (!user || !event || !commentDetail) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'User or event not found',
        });
    }
    const { replyCommemt: comment } = req.body

    commentDetail.isReply = true;
    await commentDetail.save();

    const response = await Comment.create({
        userId: user._id,
        comment,
        eventId: event._id,
        parentComment: commentDetail._id || null,
    })

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: 'Fetched comments successfully',
        result: response
    })
})

const editComment = asyncHandler(async (req: Request, res: Response) => {
    const { idComment } = req.params
    const { comment } = req.body
    const commentDetail = await Comment.findById(idComment)?.populate('parentComment')

    if(!commentDetail){
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'Comment not found',
        });
    }

    const response = await Comment.findByIdAndUpdate(idComment, {comment}, {new: true})
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Update Comment successfully' : 'Failed to update comment',
        result: response
    })
})

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { idComment } = req.params
    let response;
    const commentDetail = await Comment.findById(idComment);

    if(!commentDetail){
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'Comment not found',
        });
    }

    if (commentDetail.isReply === false) {
        response = await Comment.findByIdAndDelete(idComment);
    } else {
        const replies = await Comment.find({ parentComment: idComment });
        if (replies.length > 0) {
            commentDetail.isDeleted = true;
            await commentDetail.save();
            response = commentDetail;
        } else {
            response = await Comment.findByIdAndDelete(idComment);
        }
    }
        
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Delete Comment successfully' : 'Failed to delete comment',
    })
})

const getListCommentById = asyncHandler(async (req: Request, res: Response) => {
    const {eid, idComment} = req.params
    const event = await EventModel.findById(eid)?.populate('created_by')

    if (!event) {
        return res.status(404).json({
            status: false,
            code: 404,
            message: 'Event not found',
        });
    }

    const response = await Comment.find({
        parentComment: idComment
    })
    .populate('userId', 'username images')
    .populate('parentComment');

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: 'Fetched comments successfully',
        result: response
    })
})

export {
    createComment,
    getListCommentByIdEvent,
    replyComment,
    getListCommentById,
    editComment,
    deleteComment
}