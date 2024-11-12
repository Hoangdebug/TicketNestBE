const mongoose = require('mongoose');
const moment = require('moment-timezone');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    comment: {
        type: String,
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EventModel',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isReply:{
        type: Boolean,
        default: false
    }
}, { timestamps: true });

commentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    
    if (obj.createdAt) {
        obj.createdAt = moment(obj.createdAt).tz('Asia/Ho_Chi_Minh').format('YYYY/MM/DD HH:mm');
    }
    if (obj.updatedAt) {
        obj.updatedAt = moment(obj.updatedAt).tz('Asia/Ho_Chi_Minh').format('YYYY/MM/DD HH:mm');
    }
    if (obj.isDeleted) {
        obj.comment = 'Bình luận đã bị xóa';
    }
    return obj;
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
