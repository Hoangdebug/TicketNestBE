import { SeatStatus } from "~/utils/Common/enum";
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISeat extends Document {
    username: mongoose.Types.ObjectId;
    ticket_type: String[];
    location: mongoose.Types.ObjectId;
    quantity: number[]; 
    price: number[];
    ordered_seat: String[];
}

// Declare the Schema of the Mongo model
var seatSchema: Schema<ISeat> = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },    
    location: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EventModel'
    },
    ticket_type: {
        type: [String],
        required: true,
    },
    quantity: {
        type: [Number],  
        required: true,
    },
    price: {
        type: [Number], 
        required: true,
    },
    ordered_seat: {
        type: [String], 
        required: true,
    }
});

//Export the model
const SeatModel: Model<ISeat> = mongoose.model("Seat", seatSchema);
export default SeatModel;
