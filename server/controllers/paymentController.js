const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

// HÀM 1: Khởi tạo giao dịch thanh toán mới
exports.createPayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod, amount } = req.body;
        const cleanBookingId = String(bookingId || '').trim();
        const cleanPaymentMethod = String(paymentMethod || '').trim();

        if (!cleanBookingId || !cleanPaymentMethod || !amount) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin tạo hóa đơn!" });
        }

        const bookingExists = await Booking.findById(cleanBookingId);
        if (!bookingExists) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé!" });
        }

        const newPayment = new Payment({
            bookingId: cleanBookingId,
            userId: req.user.id,
            amount: Number(amount),
            paymentMethod: cleanPaymentMethod,
            status: 'pending'
        });

        await newPayment.save();

        return res.status(201).json({
            success: true,
            message: "Đã khởi tạo hóa đơn thanh toán.",
            data: newPayment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
};

// HÀM 2: Xử lý thanh toán + cập nhật booking + gửi email
exports.executePayment = async (req, res) => {
    const { bookingId, paymentMethod } = req.body;

    try {
        // 1. Tìm booking và lấy thông tin user
        const booking = await Booking.findById(bookingId).populate('userId').populate({
            path: 'showtimeId',
            populate: { path: 'movieId' }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé!" });
        }

        // 2. Cập nhật trạng thái booking
        booking.status = 'completed';
        booking.paymentMethod = paymentMethod;
        await booking.save();

        // 3. Cập nhật hoặc tạo payment
        let payment = await Payment.findOne({ bookingId: bookingId });
        if (payment) {
            payment.status = 'completed';
            payment.paymentMethod = paymentMethod;
            payment.paidAt = new Date();
            payment.ticketCode = 'DF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            await payment.save();
        } else {
            const newPayment = new Payment({
                bookingId: bookingId,
                userId: booking.userId._id,
                amount: booking.totalAmount,
                paymentMethod: paymentMethod,
                status: 'completed',
                paidAt: new Date(),
                ticketCode: 'DF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            await newPayment.save();
        }

        // 4. Đồng bộ ticketCode sang booking
        if (payment && payment.ticketCode) {
            booking.ticketCode = payment.ticketCode;
            await booking.save();
        }

        // 5. Gửi email (tùy chọn, không block response)
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: '"DRAGONFIRE CINEMA" <' + process.env.EMAIL_USER + '>',
                to: booking.userId.email,
                subject: `XÁC NHẬN THANH TOÁN THÀNH CÔNG - Mã vé: ${booking.ticketCode}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #e50914;">THANH TOÁN THÀNH CÔNG!</h2>
                        <p>Mã vé của bạn: <strong>${booking.ticketCode}</strong></p>
                        <p>Ghế: ${booking.seats.join(', ')}</p>
                        <p>Tổng tiền: ${booking.totalAmount.toLocaleString()} VND</p>
                        <p>Cảm ơn bạn đã sử dụng Dragonfire Cinema!</p>
                    </div>
                `
            };
            transporter.sendMail(mailOptions, (err) => {
                if (err) console.error("Lỗi gửi mail:", err);
            });
        } catch (emailError) {
            console.error("Email error:", emailError);
        }

        return res.status(200).json({ 
            success: true, 
            message: "Thanh toán thành công!", 
            data: {
                bookingId: booking._id,
                ticketCode: booking.ticketCode,
                seats: booking.seats,
                totalAmount: booking.totalAmount
            }
        });

    } catch (error) {
        console.error("Lỗi executePayment:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý thanh toán!" });
    }
};

// HÀM 3: Cập nhật trạng thái thanh toán (giữ lại nếu cần)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId, status } = req.body;
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn!" });
        }

        payment.status = status;
        if (status === 'completed') {
            payment.paidAt = new Date();
        }
        await payment.save();

        // Đồng bộ với booking
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.status = status;
            await booking.save();
        }

        return res.status(200).json({
            success: true,
            message: status === 'completed' ? "Thanh toán thành công!" : "Đã cập nhật trạng thái.",
            data: payment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};