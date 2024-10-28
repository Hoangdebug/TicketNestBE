const seat = require('../models/seat');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
import { Request, Response } from "express"


// function to creat Seat

const createSeat = asyncHandler(async (req: Request, res: Response) => {
    if (Object.keys(req.body).length = 0) throw new Error("Missing inputs")
    const newSeat = await seat.create(req.body)
    return res.status(200).json({
        status: newSeat ? true : false,
        code: newSeat ? 200 : 400,
        message: newSeat ? "Create seat successfully" : "Can not create seat",
        result: newSeat ? newSeat : 'Invalid information'
    })
})

// function to get one Seat
const getSeat = asyncHandler(async (req: Request, res: Response) => {
    const { sid } = req.params
    const getseat = await seat.findById(sid)
        .populate('location quantity price');
    return res.status(200).json({
        status: getseat ? true : false,
        code: getseat ? 200 : 400,
        message: getseat ? "Get seat successfully" : "Can not get seats",
        result: getseat ? getseat : 'Invalid information'
    })
})


// function to update one Seat

const updateSeat = asyncHandler(async (req: Request, res: Response) => {
    const { sid } = req.params
    const updatedSeat = await seat.findByIdAndUpdate(sid, req.body, { new: true })
        .populate('location quantity price');
    return res.status(200).json({
        status: updatedSeat ? true : false,
        code: updatedSeat ? 200 : 400,
        message: updatedSeat ? "Update seat successfully" : "Can not update seat",
        result: updatedSeat ? updatedSeat : 'Invalid information'
    })
})

module.exports = {
    createSeat,
    getSeat,
    updateSeat
}