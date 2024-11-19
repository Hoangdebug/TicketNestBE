const mongoose = require('mongoose');
const moment = require('moment-timezone');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EventModel',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },    
},{ timestamps: true })

ratingSchema.index({ userId: 1, eventId: 1 }, { unique: true });
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;