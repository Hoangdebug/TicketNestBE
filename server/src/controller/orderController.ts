import { Request, Response } from 'express'
import moment from 'moment';
import crypto from 'crypto';
import qs from 'qs';
const asyncHandler = require ("express-async-handler")
const Order = require ('../models/order')
const Event = require ('../models/event')
interface VNPayParams {
    vnp_Amount: number;
    vnp_Command: string;
    vnp_CreateDate: string;
    vnp_CurrCode: string;
    vnp_IpAddr: string;
    vnp_Locale: string;
    vnp_OrderInfo: string;
    vnp_OrderType: string;
    vnp_ReturnUrl: string;
    vnp_TmnCode: string;
    vnp_TxnRef: any;
    vnp_Version: string;
    vnp_SecureHash?: string; // Optional property
}

const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;
    console.log(_id);
    const { eid } = req.params;
    console.log(eid);
    const { seatcode, totalmoney, paymentCode } = req.body;

    if (!seatcode || !totalmoney) {
        return res.status(400).json({
            status: false,
            code: 400,
            result: 'All fields are required'
        });
    }

    try {
        const event = await Event.findById(eid);
        if (!event) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: 'Event not found',
                result: null
            });
        }

        const seatCount = seatcode.length;
        if (event.ticket_number < seatCount) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: 'Not enough tickets available',
                result: null
            });
        }

        const order = new Order({
            seat_code: seatcode,
            total_money: totalmoney,
            customer: _id,
            event: eid,
        });

        await order.save();

        if (!order) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: 'Failed to create order',
                result: null
            });
        }

        event.ticket_number -= seatCount;
        await event.save();

        const paymentUrl = createVNPayPaymentUrl({ amount: totalmoney, paymentCode, orderId: order._id });

        return res.status(200).json({
            status: true,
            code: 200,
            message: 'Order created successfully',
            result: order,
            paymentUrl: paymentUrl
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            status: false,
            code: 500,
            message: 'Create order failed',
            result: null
        });
    }
});

interface VNPayPaymentParams {
    amount: number;
    paymentCode: string;
    orderId: any;
}

function createVNPayPaymentUrl({ amount, paymentCode, orderId }: VNPayPaymentParams): string {
    const tmnCode = 'CGXZLSOZ"';
    const secretKey = 'XNBOJFAKAZQSGTARRLGCHVZWCIOIGSHN';
    const returnUrl = 'http://localhost:5000/payment-return';
    const createDate = moment().format('YYYYMMDDHHmmss');
    const ipAddr = '127.0.0.1'; // Get this dynamically if needed

    const vnp_Params: VNPayParams = {
        vnp_Amount: amount * 100, // Amount in VND * 100
        vnp_Command: 'pay',
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr,
        vnp_Locale: 'vn',
        vnp_OrderInfo: `Payment for order: ${orderId}`,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: returnUrl,
        vnp_TmnCode: tmnCode,
        vnp_TxnRef: orderId,
        vnp_Version: '2.1.0'
    };

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params.vnp_SecureHash = secureHash;

    const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${qs.stringify(vnp_Params, { encode: false })}`;
    return paymentUrl;
}
// Read Order
const getOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('seatcode')
    
    return res.status(200).json({
        status: true ? true : false,
        code: order ? 200 : 400,
        message: order? 'Order found' : 'Order not found',
        result: order
    })    
})

// Update Order
const updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const {_id } = req.params
    const { status, seatcode, totalmoney, settime } = req.body

    if(!status && !seatcode && !totalmoney && !settime) throw new Error('Please provide information to update!')    
    
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
    const {_id} = req.query
    if(!_id) throw new Error('Order not found')
    const response = await Order.findByIdAndDelete(_id)
    
    return res.status(200).json({
        status: response ? true : false,
        code: response ? 200 : 400,
        message: response ? 'Order had been deleted' : 'Order not found', 
        result: response 
    })    
})

module.exports = { 
    createOrder, 
    getOrder, 
    updateOrder, 
    deleteOrder
}