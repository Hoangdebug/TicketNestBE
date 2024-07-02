import { count } from 'console';
import { Request, Response } from 'express';
import moment from 'moment';
const asyncHandler = require("express-async-handler")
const Event = require('../models/event')
const Order = require('../models/order');
const Organize = require('../models/organizer');
const mongoose = require('mongoose');

//Create Event
const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;
    const { name, description, image, day_start, day_end, ticket_number, price, location, status, event_type } = req.body;
    const event = new Event({
        name,
        description,
        image,
        day_start,
        day_end,
        ticket_number,
        price,
        location,
        status,
        event_type,
        created_by: _id
    });
    await event.save();
    console.log(event)
    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 400,
        message: event ? 'Event created successfully' : 'Failed to create event',
        result: event
    });
})

//Read Event
const readEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await Event.findById(id);

    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 404,
        message: event ? 'Get event information successfully' : 'Event not found',
        result: event
    });
})

const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
    const response = await Event.find()
    return res.status(200).json({
        status: response? true : false,
        code: response? 200 : 400,
        message: response? 'Get all events successfully' : 'Failed to get all events',
        result: response
    })
})

//Update Event
const updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 400,
        message: event ? 'Update event successfully' : 'Event not found',
        result: event
    });
})

//Static Event By Month
const staticEventFollowByMonth = asyncHandler(async (req: Request, res: Response) => {
    const events = await Event.aggregate([
        {
            $group: {
                _id: { $month: "$time" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);

    return res.status(200).json({
        status: events ? true : false,
        code: events ? 200 : 400,
        message: events ? 'Get event statistics successfully' : 'Failed to get event statistics',
        result: events
    });
})

//Total order by Month role Organizer
// const getTotalOrderByMonth = asyncHandler(async (req: Request, res: Response) => {
//     const { organizerId } = req.params;

//     // Verify that the organizer exists
//     const organizer = await Organize.findById(organizerId);
//     if (!organizer) {
//         return res.status(404).json({
//             status: false,
//             code: 404,
//             message: 'Organizer not found',
//             result: null
//         });
//     }

//     // Aggregate the total orders by month for the specified organizer
//     const totalOrdersByMonth = await Order.aggregate([
//         {
//             $lookup: {
//                 from: 'seats',
//                 localField: 'seatcode.seatcode',
//                 foreignField: '_id',
//                 as: 'seat_details'
//             }
//         },
//         {
//             $unwind: '$seat_details'
//         },
//         {
//             $lookup: {
//                 from: 'events',
//                 localField: 'seat_details.event',
//                 foreignField: '_id',
//                 as: 'event_details'
//             }
//         },
//         {
//             $unwind: '$event_details'
//         },
//         {
//             $match: {
//                 'event_details.organizer': mongoose.Types.ObjectId(organizerId)
//             }
//         },
//         {
//             $group: {
//                 _id: { $month: "$settime" },
//                 totalOrders: { $sum: 1 },
//                 totalMoney: { $sum: "$totalmoney" }
//             }
//         },
//         {
//             $sort: { '_id': 1 }
//         },
//         {
//             $project: {
//                 month: '$_id',
//                 totalOrders: 1,
//                 totalMoney: 1,
//                 _id: 0
//             }
//         }
//     ]);

//     return res.status(200).json({
//         status: true,
//         code: 200,
//         message: 'Total orders by month fetched successfully',
//         result: totalOrdersByMonth
//     });
// })




module.exports = {
    createEvent,
    readEvent,
    getAllEvents,
    updateEvent,
    staticEventFollowByMonth,
    // getTotalOrderByMonth,
}