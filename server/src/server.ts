// Import thư viện Express
import express from 'express'
import { Request, Response } from 'express'
import { dbConnect } from './config/dbConnect'
import { checkAndUpdateEventStatus } from './controller/eventController'
import cron from 'node-cron'
import { PassThrough } from 'stream'
require('dotenv').config()
const initRoutes = require('./routes/index')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
const googleStrategy = require('passport-google-oauth20').Strategy

// Khởi tạo ứng dụng Express
const app = express()
const port = process.env.PORT || 8080
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
dbConnect()
initRoutes(app)

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/user/auth/google/callback'
    },
    (accessToken:any, refreshToken:any, profile:any, done:any) => {
      console.log(profile)
      return done(null, profile)
    }
  )
)

passport.serializeUser((user: any, done: any) => {
  done(null, user)
})
passport.deserializeUser((user: any, done: any) => {
  done(null, user)
})

// app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))
// app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: "/"}), (req, res) => {
//   res.redirect('/auth/google/success')
// })

// app.get("/profile", (req, res) => {
//   res.send(req.user)
// })
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
