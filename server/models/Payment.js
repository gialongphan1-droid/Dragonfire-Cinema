const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    // Khóa ngoại liên kết tới bảng Booking của Hiếu sau khi đã tách biệt
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', 
        required: true
    },
    // Khóa ngoại liên kết tới người dùng thanh toán
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Số tiền cần thanh toán
    amount: {
        type: Number,
        required: true
    },
    // Phương thức thanh toán khớp với enum thiết kế của nhóm và giao diện Figma
    paymentMethod: {
        type: String,
        required: true,
        enum: ['momo', 'vnpay'] 
    },
    // Mã giao dịch từ đối tác ví điện tử trả về
    paymentCode: {
        type: String,
        default: null
    },
    // Trạng thái hóa đơn thanh toán khớp với tiến độ xử lý trên Figma
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    // Chuỗi mã bảo mật ticketCode dùng để quét QR tại rạp
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