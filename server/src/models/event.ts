import { EventStatus, EventType } from "~/utils/Common/enum";
import mongoose, { Document, Model, Schema } from 'mongoose'; // Erase if already required

export interface IEvent extends Document {
    name: string;
    description: string;
    images: string;
    day_start: Date;
    day_end: Date;
    ticket_number?: number | undefined;
    price: number;
    location: string;
    event_type: EventType;
    is_active: boolean;
    status: EventStatus;
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
    images: {
        type: String,
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
        type: Number,
        default: 0,
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
    is_active: {
        type: Boolean,
        default: false,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
    }
}, { timestamps: true, collection: "events" });

//Export the model
const EventModel: Model<IEvent> = mongoose.model("EventModel", eventSchema)

export default EventModel