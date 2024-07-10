import { count } from 'console';
import { Request, Response } from 'express';
import moment from 'moment';
const asyncHandler = require("express-async-handler")
const Event = require('../models/event')
const Order = require('../models/order');
const Organize = require('../models/organizer');
const mongoose = require('mongoose');
const User = require('../models/user');
const sendMail = require('../config/sendMail')



//  static event by month for systems role Admin
const staticEventByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;

    // Parse the date to get the start and end of the month
    const startDate = date ? moment(date as string, "MM-YYYY").startOf("month").toDate() : moment().startOf("month").toDate();
    const endDate = date ? moment(date as string, "MM-YYYY").endOf("month").toDate() : moment().endOf("month").toDate();

    const events = await Event.find({
        time: {
            $gte: startDate,
            $lte: endDate
        }
    });

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Get event statistics successfully',
        result: events.length
    });
});

const totalPriceOrderInMonth = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;

    const startDate = date ? moment(date as string, "MM-YYYY").startOf("month").toDate() : moment().startOf("month").toDate();
    const endDate = date ? moment(date as string, "MM-YYYY").endOf("month").toDate() : moment().endOf("month").toDate();

    const orders = await Order.find({
        settime: {
            $gte: startDate,
            $lte: endDate
        }
    });

    const totalPrice = orders.reduce((acc: number, curr: any) => acc + curr.totalmoney, 0);

    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Get event statistics successfully',
        result: totalPrice
    });
});

//Send message when admin approve become organizer to notification with user

const approveOrganizer = asyncHandler(async(req: Request, res: Response) => { 
    const { email } = req.query
    if( !email ) throw new Error('Missing email')
    const user = await User.findOne({ email })
    if(!user) throw new Error('User not found!! Invalid email')
    const resetToken = user.createPasswordChangeToken()
    await user.save()

    //Send mail
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 48px;">
    <img style="width: 100%; height: 100%;" src="" alt="Logo" />
    <div style="padding: 10px; gap: 32px;">
        <h1 style="font-size: 45px; margin-bottom: 10px;">Hi ${user.username},</h1>
        <div style="font-size: 20px; line-height: 3; margin-bottom: 1rem;">
            <p>You have approved to become an organizer</p>
        </div>
        <br>
        <br>
        <hr>
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.facebook.com/your-facebook-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                <img src="" alt="Facebook" style="width: 60px; height: 60px;">
            </a>
            <a href="https://www.instagram.com/your-instagram-page-url" target="_blank" style="text-decoration: none; margin: 0 10px;">
                <img src="" alt="Instagram" style="width: 60px; height: 60px;">
            </a>
        </div>
        <hr>
        <div style="text-align: center;">
            <p>&copy; 2024 TicketNest. All rights reserved.</p>
            <br>
            <p>You are receiving this mail because you registered to join the TicketNest platform as a user or a creator. This also shows that you agree to our Terms of Use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
            <p>
                <a href="#" style="color: black; text-decoration: none;">Privacy Policy</a> •
                <a href="#" style="color: black; text-decoration: none;">Terms of Service</a> •
                <a href="#" style="color: black; text-decoration: none;">Help Center</a> •
                <a href="#" style="color: black; text-decoration: none;">Unsubscribe</a>
            </p>
        </div>
    </div>
</div>`
 
    const data = {
        email,
        html
    }

    const rs = await sendMail(data)
    return res.status(200).json({
        status: true,
        code: 200,
        message: 'Send mail successfully',
        result: rs ? rs : "Failed to send mail"
    })
})
export { staticEventByAdmin, totalPriceOrderInMonth, approveOrganizer }