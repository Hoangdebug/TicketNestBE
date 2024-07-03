import { EventStatus, EventTicket, EventType } from "~/utils/Common/enum";
import mongoose, { Document, Model, Schema } from 'mongoose'; // Erase if already required

export interface IEvent extends Document {
    name: string;
    description: string;
    image: string;
    day_start: Date;
    day_end: Date;
    ticket_number?: EventTicket;
    price: number;
    location: string;
    event_type: EventType;
    status: EventStatus
    created_by: mongoose.Types.ObjectId;
}

// Declare the Schema of the Mongo model
var eventSchema: Schema<IEvent> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    day_start: {
        type: Date,
        required: true,
    },
    day_end: {
        type: Date,
        required: true,
    },
    ticket_number: {
        type: String,
        enum: EventTicket,
        default: null,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    event_type: {
        type: String,
        enum: EventType,
        required: true
    },
    status: {
        type: String,
        default: EventStatus.PENDING,
        enum: EventStatus
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true, collection: "events" });

//Export the model
const EventModel: Model<IEvent> = mongoose.model("EventModel", eventSchema)

export default EventModel