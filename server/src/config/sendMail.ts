const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

const sendMail = asyncHandler(async ({email, html, type} : {email: string, html: string, type: string }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GOOGLE_EMAIL_NAME,
            pass: process.env.GOOGLE_EMAIL_PASSWORD,
        },
    });

    let subject = '';
    let text = '';

    switch (type) {
        case 'verify_account':
            subject = "Account Verification";
            text = `Hello,\n\nPlease use the following code to verify your account:\n`;
            break;
        case 'forgot_password':
            subject = "Forgot Password";
            text = `Hello,\n\nPlease use the following code to reset your password:\n`;
            break;
        case 'accepted':
            subject = "Organizer Request Accepted";
            text = `Hello,\n\nYour request to become an organizer has been accepted. Congratulations\n`;
            break;
        case 'rejected':
            subject = "Organizer Request Rejected";
            text = `Hello,\n\nYour request to become an organizer has been rejected.\n`;
            break;
        case 'order_details':
            subject = "Your Order Details from TicketNest";
            break;
        default:
            throw new Error('Invalid email type');
    }

    try {
        const info = await transporter.sendMail({
            from: '"TicketNest" <no-reply@example.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: text, // Plain text body
            html: html, // HTML body
        });

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});

module.exports = sendMail;