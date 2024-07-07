const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var organizeSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
    },
    sponsor_by:{
        type: mongoose.Types.ObjectId, ref:'User'
    },
    name:{
        type:String,
        required:true,
    },
    contact_email:{
        type:String,
    },
    contact_phone:{
        type:String,
    }
},{
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Organizer', organizeSchema);