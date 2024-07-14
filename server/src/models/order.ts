import { OrderStatus } from "~/utils/Common/enum";

const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({    
    seat_code:[{      
        type:String, 
    }],
    total_money:{
        type:String,
        required:true,
    },
    customer:{
        type: mongoose.Types.ObjectId, ref:'User'
    },
    event:{
        type: mongoose.Types.ObjectId, ref:'Event'
    },
    payment:{
        type:String,
        default: OrderStatus.SUCCESSED
    }

}, {timeStamp: true});

//Export the model
module.exports = mongoose.model('Order', orderSchema);