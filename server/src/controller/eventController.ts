import { count } from 'console'
import { Request, Response } from 'express'
import moment from 'moment'
import { FilterQuery } from 'mongoose'
import { getAllWithPagination } from '~/core/pagination'
import EventModel, { IEvent } from '~/models/event'
import SeatModel, { ISeat } from '~/models/seat'
import { EventStatus } from '~/utils/Common/enum'
const asyncHandler = require('express-async-handler')
const Order = require('../models/order')
const Event = require('../models/event')
const User = require('../models/user')
const Organizer = require('../models/organizer')

//Search Event
const searchEvents = asyncHandler(async (req: Request, res: Response) => {
  const { keyword } = req.query
  //nhan keyword

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Invalid search keyword',
      result: []
    })
  }

  const searchRegex = new RegExp(keyword, 'i')
  //khong phan biet chu hoa chu thuong

  const events = await EventModel.find({
    $or: [{ name: { $regex: searchRegex } }, { location: { $regex: searchRegex } }]
  })

  return res.status(200).json({
    status: true,
    code: 200,
    message: 'Search results fetched successfully',
    result: events
  })
})

//Create EventModel
const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.user
  const user = await User.findById(_id)
  const {
    name,
    description,
    image,
    day_start,
    day_end,
    day_event,
    ticket_number,
    price,
    location,
    ticket_type,
    quantity,
    status,
    event_type
  } = req.body
  const event = new EventModel({
    name,
    description,
    image,
    day_start,
    day_end,
    day_event,
    ticket_number,
    price,
    location,
    ticket_type,
    quantity,
    status,
    event_type,
    created_by: user.organizerRef
  })
  await event.save()
  console.log(event)

  const seat = new SeatModel({
    username: _id,
    status: EventStatus.PENDING,
    location: event._id,
    ticket_type: event.ticket_type,
    quantity: event.quantity,
    price: event.price
  })

  await seat.save()

  return res.status(200).json({
    status: event ? true : false,
    code: event ? 200 : 400,
    message: event ? 'Event created successfully' : 'Failed to create event',
    result: event
  })
})

//Read EventModel
const readEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eid } = req.params
  const event = await EventModel.findById(eid).populate('created_by')
  // const user = await User.findById(event?.created_by)

  return res.status(200).json({
    status: event ? true : false,
    code: event ? 200 : 404,
    message: event ? 'Get event information successfully' : 'Event not found',
    result: event
  })
})

const getLocation = asyncHandler(async (req: Request, res: Response) => {
  const validLocations = ['Location A', 'Location B', 'Location C', 'ANOTHER']

  return res.status(200).json({
    status: true,
    code: 200,
    message: 'Get valid locations successfully',
    result: validLocations
  })
})

const getEventByOrganizer = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.user
  const organizer = await Organizer.findOne({ sponsor_by: _id })
  const event = await EventModel.find({ created_by: organizer._id }).populate('created_by')
  return res.status(200).json({
    status: event ? true : false,
    code: event ? 200 : 404,
    message: event ? 'Get event information successfully' : 'Event not found',
    result: event
  })
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
  const { eid } = req.params
  const { status } = req.body
  const response = await EventModel.findByIdAndUpdate(eid, { status: status }, { new: true }).populate('created_by')
  return res.status(200).json({
    status: response ? true : false,
    code: response ? 200 : 400,
    message: response ? 'Aproved events successfully' : 'Failed to get all events',
    result: response
  })
})

const getAllEventsWithPagination = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, type } = req.query

  let findCondition: FilterQuery<IEvent> = {}

  if (type) {
    findCondition = {
      ...findCondition,
      event_type: type
    }
  }

  const totalEvents = await EventModel.countDocuments(findCondition)
  const totalPage = Math.ceil(totalEvents / Number(pageSize))

  const response = await getAllWithPagination<IEvent>(EventModel, {
    page: page as number,
    pageSize: pageSize as number,
    findCondition
  })

  return res.status(200).json({
    status: response ? true : false,
    code: response ? 200 : 400,
    message: response ? 'Get all events successfully' : 'Failed to get all events',
    result: response,
    totalPage
  })
})

//Update EventModel
const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  const event = await EventModel.findByIdAndUpdate(id, updates, { new: true })

  return res.status(200).json({
    status: event ? true : false,
    code: event ? 200 : 400,
    message: event ? 'Update event successfully' : 'Event not found',
    result: event
  })
})

//Static EventModel By Month
const staticEventFollowByMonth = asyncHandler(async (req: Request, res: Response) => {
  const events = await EventModel.aggregate([
    {
      $group: {
        _id: { $month: '$time' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  return res.status(200).json({
    status: events ? true : false,
    code: events ? 200 : 400,
    message: events ? 'Get event statistics successfully' : 'Failed to get event statistics',
    result: events
  })
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
  const { eventId } = req.params
  console.log(eventId) // Log the eid to verify it's being received
  console.log(req.file)
  if (!req.file) throw new Error('Missing input files')
  const response = await EventModel.findByIdAndUpdate(eventId, { $set: { images: req.file?.path } }, { new: true })
  console.log(response) // Log the response to verify the update
  return res.status(200).json({
    status: response ? true : false,
    code: response ? 200 : 400,
    message: response ? 'Image uploaded successfully' : 'Can not upload image',
    result: response ? response : 'Can not upload file!!!!'
  })
})

export const checkAndUpdateEventStatus = async () => {
  const currentDate = new Date()

  // Tìm tất cả các sự kiện có `day_end` vượt qua ngày hiện tại và không có trạng thái là `CANCELLED`
  const eventsToUpdate = await EventModel.find({
    day_end: { $lt: currentDate },
    status: { $ne: EventStatus.CANCELLED }
  })

  if (eventsToUpdate.length > 0) {
    for (const event of eventsToUpdate) {
      event.status = EventStatus.CANCELLED
      await event.save()
    }
    console.log(`${eventsToUpdate.length} event(s) updated to status CANCELLED.`)
  } else {
    console.log('No events to update.')
  }
}

export {
  searchEvents,
  createEvent,
  readEvent,
  getAllEvents,
  updateEvent,
  staticEventFollowByMonth,
  getEventByOrganizer,
  getAllEventsWithPagination,
  uploadImage,
  updateEventsStatus,
  getLocation
  // getTotalOrderByMonth,
}
