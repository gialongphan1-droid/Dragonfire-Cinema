const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', 
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['momo', 'vnpay']  // ✅ Chỉ giữ momo và vnpay, bỏ atm
    },
    paymentCode: {
        type: String,
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    ticketCode: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);