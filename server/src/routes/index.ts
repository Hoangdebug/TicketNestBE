import { Application } from "express"

const userRouter = require("./userRouter")
const seatRouter = require("./seatRouter")
const organizerRouter = require("./organizerRouter")
const eventRouter = require("./eventRouter")
const orderRouter = require("./orderRouter")
const adminRouter = require("./adminRouter")
const commentRouter = require("./commentRouter")
const ratingRouter = require("./ratingRouter")

const { notFound, errHandler } = require('../middlewares/errorHandler')

const initRoutes = (app: Application) => {
    //user Router
    app.use('/api/user', userRouter)
    app.use('/api/event', eventRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/seat', seatRouter)
    app.use('/api/organizer', organizerRouter)
    app.use('/api/admin', adminRouter)
    app.use('/api/comment', commentRouter)
    app.use('/api/rating', ratingRouter)
    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes