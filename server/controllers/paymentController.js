const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// HÀM 1: Khởi tạo một giao dịch thanh toán mới (Trạng thái ban đầu: pending)
exports.createPayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod, amount } = req.body;
        const cleanBookingId = String(bookingId || '').trim();
        const cleanPaymentMethod = String(paymentMethod || '').trim();

        if (!cleanBookingId || !cleanPaymentMethod || !amount) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin tạo hóa đơn!" });
        }

        // Kiểm tra đơn đặt vé của Hiếu xem có tồn tại không
        const bookingExists = await Booking.findById(cleanBookingId);
        if (!bookingExists) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé!" });
        }

        const newPayment = new Payment({
            bookingId: cleanBookingId,
            userId: req.user ? req.user.id : bookingExists.userId, // Ưu tiên lấy từ token đăng nhập
            amount: Number(amount),
            paymentMethod: cleanPaymentMethod,
            status: 'pending'
        });

        await newPayment.save();

        return res.status(201).json({
            success: true,
            message: "Đã khởi tạo hóa đơn thanh toán (Đang chờ xử lý).",
            data: newPayment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
};

// HÀM 2: Xử lý kết quả thanh toán 
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId, status, paymentCode } = req.body;
        const cleanPaymentId = String(paymentId || '').trim();
        const cleanStatus = String(status || 'completed').trim(); // 'completed' hoặc 'cancelled'

        const payment = await Payment.findById(cleanPaymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn này!" });
        }

        // Cập nhật thông tin cho bảng Payment
        payment.status = cleanStatus;
        if (paymentCode) payment.paymentCode = String(paymentCode).trim();
        
        if (cleanStatus === 'completed') {
            payment.paidAt = new Date();
            // Tạo mã vé ticketCode ngẫu nhiên để ra rạp quét QR
            payment.ticketCode = 'DF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        await payment.save();

        // ĐỒNG BỘ: Cập nhật trạng thái sang bảng Booking của Hiếu để hoàn tất luồng hệ thống
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.status = cleanStatus;
            // Nếu bảng Booking của Hiếu vẫn giữ trường này, chúng ta đồng bộ luôn sang cho đồng nhất
            if ('paymentMethod' in booking) booking.paymentMethod = payment.paymentMethod;
            if ('paymentCode' in booking) booking.paymentCode = payment.paymentCode;
            if ('ticketCode' in booking) booking.ticketCode = payment.ticketCode;
            await booking.save();
        }

        return res.status(200).json({
            success: true,
            message: cleanStatus === 'completed' ? "Thanh toán thành công!" : "Giao dịch đã bị hủy bỏ.",
            data: payment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật: " + error.message });
    }
};