const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String,
        required: false
    },
    messages: [{
        from: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    unread: { type: Number, default: 0 },
    new: { type: Boolean, defualt: false }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;