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


// HÀM 2: Cập nhật trạng thái Booking sang Đã thanh toán + Gửi Email hóa đơn
exports.executePayment = async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  try {
    const Booking = require('../models/Booking');
    const Payment = require('../models/Payment');
    const nodemailer = require('nodemailer');

    // 1. Tìm đơn đặt vé và lấy kèm thông tin User để lấy email khách hàng
    const bookingExists = await Booking.findById(bookingId).populate('userId');
    if (!bookingExists) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé!" });
    }

    // 2. Chuyển đổi trạng thái đơn đặt vé của Hiếu từ 'Chờ thanh toán' sang 'Đã thanh toán'
    bookingExists.status = 'Đã thanh toán'; 
    await bookingExists.save();

    // 3. Cập nhật trạng thái bản ghi thanh toán của Đạt sang hoàn thành để đồng bộ
    const payment = await Payment.findOne({ bookingId: bookingId });
    if (payment) {
      payment.status = 'completed';
      payment.paymentMethod = paymentMethod;
      await payment.save();
    }

    // 4. Gửi email hóa đơn tự động bằng Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email_nhom_dat@gmail.com', // Điền Gmail nhóm dùng để test vào đây
        pass: 'abcd efgh ijkl mnop' // Mã mật khẩu ứng dụng 16 ký tự của Google
      }
    });

    const mailOptions = {
      from: '"DRAGONFIRE CINEMA" <email_nhom_dat@gmail.com>',
      to: bookingExists.userId?.email || "khachhang_test@gmail.com",
      subject: `[DRAGONFIRE CINEMA] XÁC NHẬN THANH TOÁN THÀNH CÔNG HÓA ĐƠN VÉ`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; border-top: 5px solid #ff2323;">
            <h2 style="color: #ff2323; text-align: center; margin-top: 0;">THANH TOÁN THÀNH CÔNG!</h2>
            <p>Hệ thống xác nhận mã đơn đặt vé <b>#${bookingExists._id}</b> của bạn đã được thanh toán hoàn tất.</p>
            <p>Trạng thái đơn hàng tại mục <b>Lịch sử đặt vé</b> đã được cập nhật thành công.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0 suicide;"/>
            <p style="font-size: 12px; color: #777; text-align: center;">Cảm ơn bạn đã lựa chọn Dragonfire Cinema!</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Lỗi gửi mail hóa đơn:", err);
    });

    return res.status(200).json({ success: true, message: "Thanh toán thành công!", data: bookingExists });

  } catch (error) {
    console.error("Lỗi xử lý executePayment:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật thanh toán!" });
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