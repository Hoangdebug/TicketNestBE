// Import thư viện Express
import express from 'express'
import { Request, Response } from 'express'
import { dbConnect } from './config/dbConnect'
import { checkAndUpdateEventStatus } from './controller/eventController'
import cron from 'node-cron'
import { PassThrough } from 'stream'
require('dotenv').config()
const User = require('../src/models/user')
const initRoutes = require('./routes/index')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
const GoogleStrategy = require('passport-google-oauth20').Strategy

// Khởi tạo ứng dụng Express
const app = express()
const port = process.env.PORT || 8080
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)

app.use(passport.initialize())
app.use(passport.session())

function generateRandomPhoneNumber() {
  const prefix = '09';
  let phoneNumber = prefix;

  for (let i = 0; i < 8; i++) {
    // Tạo một chữ số ngẫu nhiên từ 0 đến 9
    const randomDigit = Math.floor(Math.random() * 10);
    phoneNumber += randomDigit;
  }

  return phoneNumber;
}

passport.use(

  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/user/auth/google/callback',
    },
    async (accessToken: any, refreshToken: any, profile: any) => {
      console.log(profile);
      const randomPhone = generateRandomPhoneNumber();
      const dataUser = {
        username: profile?.displayName,
        email: profile?.emails[0].value,
        images: profile?._json.picture,
        isActive: profile?._json.email_verified,
        phone: randomPhone
      };
    
      try {
        let user = await User.findOne({ email: dataUser.email });
        console.log(user);
        if (user) {
          return user;
        } else {
          user = await User.create(dataUser);
          return user;
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  )
)

passport.serializeUser((user: any, done: any) => {
  done(null, user)
})
passport.deserializeUser((user: any, done: any) => {
  done(null, user)
})

dbConnect()
initRoutes(app)
// app.get('http://localhost:5000/api/user/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get('http://localhost:5000/api/user/auth/google/callback', passport.authenticate('google', { failureRedirect: "/" }), (req, res) => {
  console.log("ok")
  res.redirect("http://localhost:4500/home");  
})

// Định nghĩa một route cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

// Lắng nghe cổng 3000 cho các kết nối HTTP
app.listen(port, () => {
  console.log('Server is running on port', port)
})

cron.schedule('0 0 * * *', () => {
  console.log('Running a daily job at midnight')
  checkAndUpdateEventStatus()
})
