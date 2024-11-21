const seat = require('../models/seat');
const Event = require('../models/event')
const User = require('../models/user');
import SeatModel, { ISeat } from '~/models/seat';
import EventModel, { IEvent } from '~/models/event';
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
import { Request, Response } from "express"
import { SeatStatus } from '~/utils/Common/enum';

const createSeat = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, ordered_seat } = req.body;

    if (!eventId) {
        return res.status(400).json({ success: false, mes: "Event ID is missing" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    const seat = new SeatModel({
        username: '615f1f1f1f1f1f1f1f1f1f1f',
        location: event._id,
        ticket_type: event.ticket_type,
        quantity: event.quantity,
        price: event.price,
        ordered_seat,
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
    const { seatId } = req.params;
    const { status } = req.body;

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
    const { sid } = req.params;
    const getseat = await SeatModel.findById(sid)
        .populate('location')
        .populate('ticket_type quantity price');
    return res.status(200).json({
        status: getseat ? true : false,
        code: getseat ? 200 : 400,
        message: getseat ? "Get seat successfully" : "Can not get seat",
        result: getseat ? getseat : 'Invalid information'
    });
});

const getSeatByEventId = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({
            success: false,
            message: "Event ID is required"
        });
    }

    const seats = await SeatModel.find({ location: eventId });

    if (!seats || seats.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No seats found for this event"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Seats fetched successfully",
        result: seats
    });
});

// function to update one Seat

const updateSeat = asyncHandler(async (req: Request, res: Response) => {
    const { sid } = req.params
    const updatedSeat = await seat.findByIdAndUpdate(sid, req.body, { new: true })
        .populate('location ticket_type quantity price');
    return res.status(200).json({
        status: updatedSeat ? true : false,
        code: updatedSeat ? 200 : 400,
        message: updatedSeat ? "Update seat successfully" : "Can not update seat",
        result: updatedSeat ? updatedSeat : 'Invalid information'
    })
})

const updateOrderSeat = asyncHandler(async (req: Request, res: Response) => {
    const { seatId } = req.params;
    const { new_ordered_seat } = req.body;

    if (!seatId || !new_ordered_seat || !Array.isArray(new_ordered_seat)) {
        return res.status(400).json({ 
            success: false, 
            message: "Seat ID and new ordered seats are required" 
        });
    }

    const seat = await SeatModel.findById(seatId);
    if (!seat) {
        return res.status(404).json({ 
            success: false, 
            message: "Seat not found" 
        });
    }

    const updatedOrderedSeats = [
        ...new Set([...seat.ordered_seat, ...new_ordered_seat])
    ];
    seat.ordered_seat = updatedOrderedSeats;

    await seat.save();

    return res.status(200).json({
        success: true,
        message: "Ordered seats updated successfully",
        result: seat
    });
});


module.exports = {
    createSeat,
    updateSeatStatus,
    getSeat,
    updateSeat,
    getSeatByEventId,
    updateOrderSeat
}