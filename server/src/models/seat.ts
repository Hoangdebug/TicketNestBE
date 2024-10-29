import { SeatStatus } from "~/utils/Common/enum";
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISeat extends Document {
    username: mongoose.Types.ObjectId;
    status: SeatStatus;
    location: mongoose.Types.ObjectId;
    quantity: number[]; 
    price: number[];
}

// Declare the Schema of the Mongo model
var seatSchema: Schema<ISeat> = new mongoose.Schema({
    username: {
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
    },
    status: {
        type: String,
        default: SeatStatus.PENDING,
        enum: SeatStatus
    },
    location: {
        location: { type: mongoose.Types.ObjectId, ref: 'EventModel' }
    },
    quantity: {
        type: [Number],  
        required: true,
    },
    price: {
        type: [Number], 
        required: true,
    }
});

//Export the model
const SeatModel: Model<ISeat> = mongoose.model("Seat", seatSchema);
export default SeatModel;
