import { Application } from "express";

<<<<<<< HEAD
const userRouter = require("./userRouter");
const seatRouter = require("./seatRouter");
const organizerRouter = require("./organizerRouter");
const eventRouter = require("./eventRouter");
const orderRouter = require("./orderRouter");
const adminRouter = require("./adminRouter");
const favouriteRouter = require("./favouriteRouter");
=======
const userRouter = require("./userRouter")
const seatRouter = require("./seatRouter")
const organizerRouter = require("./organizerRouter")
const eventRouter = require("./eventRouter")
const orderRouter = require("./orderRouter")
const adminRouter = require("./adminRouter")
const commentRouter = require("./commentRouter")
const ratingRouter = require("./ratingRouter")
>>>>>>> fd5132d72c5da116d751787688dce59d03598094

const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app: Application) => {
<<<<<<< HEAD
    // User Router
    app.use("/api/user", userRouter);
    app.use("/api/event", eventRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/seat", seatRouter);
    app.use("/api/organizer", organizerRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/favourites", favouriteRouter); 
=======
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
>>>>>>> fd5132d72c5da116d751787688dce59d03598094

    app.use(notFound);
    app.use(errHandler);
};

module.exports = initRoutes;
