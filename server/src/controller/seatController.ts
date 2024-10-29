const seat = require('../models/seat');
const Event = require('../models/event')
const User = require('../models/user');
import SeatModel, { ISeat } from '~/models/seat';
import EventModel, { IEvent } from '~/models/event';
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
import { Request, Response } from "express"
import { SeatStatus } from '~/utils/Common/enum';


// function to creat Seat

const createSeat = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.body;

    // Kiểm tra xem eventId có tồn tại không
    if (!eventId) {
        return res.status(400).json({ success: false, mes: "Event ID is missing" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    // Tạo ghế duy nhất với mảng price và quantity từ event
    const seat = new SeatModel({
        username: '615f1f1f1f1f1f1f1f1f1f1f',   // user giả định nếu cần
        status: SeatStatus.PENDING,  // Sử dụng giá trị từ enum SeatStatus
        location: event._id,
        quantity: event.quantity,  // Gán mảng quantity từ event
        price: event.price,        // Gán mảng price từ event
    });

    await seat.save();

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Seats created successfully',
        result: seat,
    });
});



const updateSeatStatus = asyncHandler(async (req: Request, res: Response) => {
    const { seatId } = req.params; // Lấy seatId từ params
    const { status } = req.body;   // Lấy trạng thái mới từ request body

    // Cập nhật trạng thái của ghế
    const updatedSeat = await SeatModel.findByIdAndUpdate(seatId, { status }, { new: true });

    return res.status(200).json({
        status: updatedSeat ? true : false,
        code: updatedSeat ? 200 : 400,
        message: updatedSeat ? 'Seat status updated successfully' : 'Seat not found',
        result: updatedSeat
    });
});

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
    updateSeatStatus,
    getSeat,
    updateSeat
}