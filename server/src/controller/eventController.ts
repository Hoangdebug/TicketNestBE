import { count } from 'console';
import { Request, Response } from 'express';
import moment from 'moment';
import { FilterQuery } from 'mongoose';
import { getAllWithPagination } from '~/core/pagination';
import EventModel, { IEvent } from '~/models/event';
import { EventStatus } from '~/utils/Common/enum';
const asyncHandler = require("express-async-handler")
const Order = require('../models/order');
const Event = require('../models/event')
const User = require('../models/user');
const Organizer = require('../models/organizer');


//Create EventModel
const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;
    const user = await User.findById(_id)
    const { name, description, image, day_start, day_end, ticket_number, price, location, status, event_type } = req.body;
    const event = new EventModel({
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
        created_by: user.organizerRef
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

//Read EventModel
const readEvent = asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.params;
    const event = await EventModel.findById(uid);
    const user = await User.findById(event?.created_by)
    const organizer = await Organizer.findById({ sponsor_by: user._id });
    const eventResult = {event, organizer_by: organizer.name}

    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 404,
        message: event ? 'Get event information successfully' : 'Event not found',
        result: event
    });
})

const getEventByOrganizer = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;
    const organizer = await Organizer.findOne({sponsor_by: _id });
    const event = await EventModel.find({ created_by: organizer._id }).populate('created_by');
    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 404,
        message: event ? 'Get event information successfully' : 'Event not found',
        result: event
    });
})

const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
    const response = await EventModel.find().populate('created_by')
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Get all events successfully' : 'Failed to get all events',
        result: response
    })
})

const updateEventsStatus = asyncHandler(async (req: Request, res: Response) => {
    const { eid } = req.params;
    const {status} = req.body
    console.log(eid)
    const response = await EventModel.findByIdAndUpdate(eid, {status: status}, {new: true}).populate('created_by');
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Aproved events successfully' : 'Failed to get all events',
        result: response
    })
});

const getAllEventsWithPagination = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, pageSize = 20, type } = req.query;

    let findCondition: FilterQuery<IEvent> = {}

    if (type) {
        findCondition = {
            ...findCondition,
            event_type: type
        }
    }

    const response = await getAllWithPagination<IEvent>(EventModel,
        {
            page: page as number,
            pageSize: pageSize as number,
            findCondition,
        }
    )

    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Get all events successfully' : 'Failed to get all events',
        result: response
    })
})

//Update EventModel
const updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const event = await EventModel.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json({
        status: event ? true : false,
        code: event ? 200 : 400,
        message: event ? 'Update event successfully' : 'Event not found',
        result: event
    });
})

//Static EventModel By Month
const staticEventFollowByMonth = asyncHandler(async (req: Request, res: Response) => {
    const events = await EventModel.aggregate([
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

//upload image



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

const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.params
    if (!req.files) throw new Error('Missing input files')
    const response = await EventModel.findByIdAndUpdate(_id, { $set: { image: req.file?.path } }, { new: true })
    console.log(req.files)
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Image uploaded successfully' : 'Can not upload image',
        result: response ? response : 'Can not upload file!!!!'
    })
})







export {
    createEvent,
    readEvent,
    getAllEvents,
    updateEvent,
    staticEventFollowByMonth,
    getEventByOrganizer,
    getAllEventsWithPagination,
    uploadImage,
    updateEventsStatus, 
    // getTotalOrderByMonth,
}