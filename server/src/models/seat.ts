const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var seatSchema = new mongoose.Schema({
    username:{
        user: {type:mongoose.Types.ObjectId, ref:'User'},
    },
    seatcode:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default: 'False',
        enum:['True','False']
    },
    location: {
        location: {type: mongoose.Types.ObjectId, ref:'EventModel'}
    },
    quantity: {
        quantity: {type: mongoose.Types.ObjectId, ref:'EventModel'}
    },
    price: {
        price: {type: mongoose.Types.ObjectId, ref:'EventModel'}
    }
});

//Export the model
module.exports = mongoose.model('Seat', seatSchema);