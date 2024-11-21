import checkoutNodeJssdk from '@paypal/checkout-server-sdk'
import { Request, Response } from 'express'
const asyncHandler = require('express-async-handler')
const Order = require('../models/order')
const User = require('../models/user')
import EventModel, { IEvent } from '~/models/event'
import paypalClient from '~/config/paypalClient'
import { Role } from '~/utils/Common/enum'
const { generalQRCode } = require('./QRCodeController');
const sendMail = require('../config/sendMail')
interface PayPalLink {
  href: string
  rel: string
  method: string
}

const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.user
  const { eid } = req.params
  const { seatcode, totalmoney, paymentCode } = req.body

  if (!seatcode || !totalmoney) {
    return res.status(400).json({
      status: false,
      code: 400,
      result: 'All fields are required'
    })
  }

  try {
    const event = await EventModel.findById(eid)
    if (!event) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Event not found',
        result: null
      })
    }

    const ticketNumber = event.ticket_number ?? 0

    const seatCount = seatcode.length

    const order = new Order({
      seat_code: seatcode,
      total_money: totalmoney,
      customer: _id,
      event: eid
    })

    await order.save()

    if (!order) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Failed to create order',
        result: null
      })
    }

    event.ticket_number = ticketNumber - seatCount
    await event.save()

    if (paymentCode === 'paypal') {
      const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
      request.prefer('return=representation')
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order._id.toString(),
            amount: {
              currency_code: 'USD',
              value: totalmoney.toString()
            },
            description: `Payment for order: ${order._id}`
          }
        ],
        application_context: {
          return_url: 'http://localhost:4500/user/payment/payment-return',
          cancel_url: 'http://localhost:4500/payment-cancel'
        }
      })

      const createOrderResponse = await paypalClient.client().execute(request)
      const paymentUrl = createOrderResponse.result.links.find(
        (link: { href: string; rel: string; method: string }) => link.rel === 'approve'
      )?.href

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'Order created successfully',
        result: order,
        paymentUrl: paymentUrl
      })
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Order created successfully',
      result: order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Create order failed',
      result: null
    })
  }
})

const captureOrder = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(token as string)
  request.requestBody({})

  try {
    const captureOrderResponse = await paypalClient.client().execute(request)

    if (captureOrderResponse.result.status === 'COMPLETED') {
      const orderId = captureOrderResponse.result.purchase_units[0].reference_id
      const order = await Order.findById(orderId)
      if (order) {
        order.status = 'paid'
        await order.save()
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'Payment successful',
        result: captureOrderResponse.result
      })
    } else {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Payment not completed',
        result: captureOrderResponse.result
      })
    }
  } catch (error: any) {
    if (error.statusCode === 422 && error._originalError?.text.includes('ORDER_ALREADY_CAPTURED')) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Order already captured',
        result: null
      })
    }

    console.error('Error capturing order:', error)
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Payment failed',
      result: null
    })
  }
})
// Read Order
const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('seatcode')

  return res.status(200).json({
    status: true ? true : false,
    code: order ? 200 : 400,
    message: order ? 'Order found' : 'Order not found',
    result: order
  })
})

const getOrderList = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.user

  const user = await User.findById(_id)
  if (!user) {
    return res.status(404).json({
      status: false,
      code: 404,
      message: 'User not found',
      result: null
    })
  }

  let orders

  if (user.role === Role.ROLE_ADMIN) {
    orders = await Order.find()
      .populate('customer', 'username')
      .populate('event', 'name location quantity price ticket_number day_start day_end')
  } else {
    orders = await Order.find({ customer: _id })
      .populate('customer', 'username')
      .populate('event', 'name location quantity price ticket_number day_start day_end')
  }

  return res.status(200).json({
    status: true,
    code: orders ? 200 : 400,
    message: orders ? '' : 'Orders not found',
    result: orders
  })
})

// Update Order
const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.params
  const { status, seatcode, totalmoney, settime } = req.body

  if (!status && !seatcode && !totalmoney && !settime) throw new Error('Please provide information to update!')

  const updateData: any = {}
  if (status) updateData.status = status
  if (seatcode) updateData.seatcode = seatcode
  if (totalmoney) updateData.totalmoney = totalmoney
  if (settime) updateData.settime = settime

  const response = await Order.findByIdAndUpdate(_id, updateData, { new: true })

  return res.status(200).json({
    status: response ? true : false,
    code: response ? 200 : 400,
    message: response ? 'Update order successful' : 'Order not found',
    result: response
  })
})

// Delete Order
const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.query
  if (!_id) throw new Error('Order not found')
  const response = await Order.findByIdAndDelete(_id)

  return res.status(200).json({
    status: response ? true : false,
    code: response ? 200 : 400,
    message: response ? 'Order had been deleted' : 'Order not found',
    result: response
  })
})

const sendOrderEmail = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;








  try {
    // Lấy thông tin đơn hàng
    const order = await Order.findById(orderId)
      .populate({
        path: 'customer',
        select: 'username email phone',
      })
      .populate({
        path: 'event',
        select: 'name day_event location event_type',
      });

    if (!order) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Order not found',
        result: null,
      });
    }





    // Dữ liệu QR
    const qrData = `
      Customer: ${order.customer.username}
      Email: ${order.customer.email}
      Phone: ${order.customer.phone}
      Event: ${order.event.name}
      Location: ${order.event.location}
      Event Type: ${order.event.event_type}
      Event Date: ${new Date(order.event.day_event).toLocaleString()}
      Seats: ${order.seat_code.join(', ')}
     Total Money: $${order.total_money}
    Payment Status: ${order.payment}
    `;

    // Tạo QR Code và upload lên Cloudinary
    const qrCodeUrl = await generalQRCode(qrData);
    // Nội dung email
    const htmlContent = `
      <h1>Order Details</h1>
      <p><strong>Customer Name:</strong> ${order.customer.username}</p>
      <p><strong>Email:</strong> ${order.customer.email}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Event:</strong> ${order.event.name}</p>
      <p><strong>Location:</strong> ${order.event.location}</p>
      <p><strong>Event Type:</strong> ${order.event.event_type}</p>
      <p><strong>Event Date:</strong> ${new Date(order.event.day_event).toLocaleString()}</p>
      <p><strong>Seats:</strong> ${order.seat_code.join(', ')}</p>
      <p><strong>Total Money:</strong> $${order.total_money}</p>
      <p><strong>Payment Status:</strong> ${order.payment}</p>
      <h2>QR Code:</h2>
      <img src="${qrCodeUrl}" alt="QR Code" />
    `;






    // Gửi email
    await sendMail({
      email: order.customer.email,
      html: htmlContent,
      type: 'order_details',
    });

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Order details and QR code sent to email successfully',
      result: order,
    });
  } catch (error) {
    console.error('Error sending order email:', error);
    res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to send order email',
      result: null,
    });
  }
});






module.exports = {
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  captureOrder,
  sendOrderEmail,
  getOrderList
}
