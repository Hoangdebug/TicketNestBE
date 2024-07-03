import { timeStamp } from "console";
import { EventTicket, EventType } from "~/utils/Common/enum";

const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var eventSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    day_start:{
        type:Date,
        required:true,
    },
    day_end:{
        type:Date,
        required:true,
    },
    ticket_number:{
        type:String,
        enum: EventTicket,
        default: null,
    },
    price:{
        type:Number,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    event_type:{
        type:String,
        enum: EventType,
        default: null,
    },
    status:{
        type:String,
        default: 'Pending',
        enum:['Cancelled', 'Pending', 'Successed']
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},{timeStamp: true});

//Export the model
module.exports = mongoose.model('Event', eventSchema);