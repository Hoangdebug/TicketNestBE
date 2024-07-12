const nodemailer = require('nodemailer')
const asyncHandler = require("express-async-handler")

const sendMail =  asyncHandler(async ({email, html, type} : {email: string, html: string, type: string }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
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
          case 'accept':
              subject = "Organizer Request Accepted";
              text = `Hello,\n\nYour request to become an organizer has been accepted. Congratulations\n`;
              break;
          case 'reject':
              subject = "Organizer Request Rejected";
              text = `Hello,\n\nYour request to become an organizer has been rejected.\n`;
              break;
          default:
              throw new Error('Invalid email type');
      }
  
      const info = await transporter.sendMail({
          from: '"TicketNest" <no-reply@example.com>', // sender address
          to: email, // list of receivers
          subject: subject, // Subject line
          text: text, // Plain text body
          html: html, // HTML body
      });
          
         return info 
})

module.exports = sendMail