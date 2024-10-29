const seat = require('../models/seat');
const Event = require('../models/event')
const User = require('../models/user');
import SeatModel, { ISeat } from '~/models/seat';
import EventModel, { IEvent } from '~/models/event';
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
import { Request, Response } from "express"


// function to creat Seat

const createSeat = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.body; // Lấy eventId từ request body
    const userId = req.user._id;  // Lấy user từ token

    // Tìm sự kiện
    const event = await EventModel.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Lấy quantity và price từ Event
    const seats = [];
    for (let i = 0; i < event.quantity.length; i++) {
        const seat = new SeatModel({
            username: user._id,       // Người dùng tạo ghế
            status: 'PENDING',        // Trạng thái ban đầu của ghế
            location: event._id,      // Liên kết ghế với sự kiện
            quantity: event.quantity[i], // Số lượng từ event
            price: event.price[i],    // Giá từ event
        });
        await seat.save();  // Lưu ghế vào cơ sở dữ liệu
        seats.push(seat);   // Thêm ghế vào danh sách đã tạo
    }

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Seats created successfully',
        result: seats,
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