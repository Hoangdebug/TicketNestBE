import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
    cusname: {
        user: { type: mongoose.Types.ObjectId, ref: "User" },
    },
    eventname: {
        event: { type: mongoose.Types.ObjectId, ref: "EventModel" },
    },
});

const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite; // Sử dụng export default
