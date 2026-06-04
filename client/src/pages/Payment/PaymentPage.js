import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [loading, setLoading] = useState(false);

  // Nhận dữ liệu đơn vé thật do trang của Hiếu truyền sang qua trạng thái điều hướng (State)
  const bookingData = location.state || {};
  const { bookingId, movieTitle, showtime, seatNumber, amount } = bookingData;

  const handlePaymentSubmit = async () => {
    if (!bookingId) return alert("Không tìm thấy mã đơn đặt vé!");
    setLoading(true);
    try {
      // Gọi API execute ở Backend để cập nhật trạng thái lịch sử sang 'Đã thanh toán' và kích hoạt gửi thư
      const response = await axios.post('http://localhost:5000/api/payment/execute', {
        bookingId: bookingId,
        paymentMethod: paymentMethod
      });

      if (response.data.success) {
        alert("🎉 Thanh toán thành công! Hóa đơn điện tử đã được gửi vào Email của bạn.");
        navigate('/my-bookings'); // Chuyển người dùng thẳng về trang Lịch sử đặt vé
      }
    } catch (error) {
      console.error(error);
      alert("Xử lý giao dịch thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Trường hợp người dùng cố tình gõ link /payment trực tiếp, ép quay về trang chủ đặt vé
  if (!bookingId) {
    return (
      <div style={{ background: '#111', color: '#fff', padding: '100px', textAlign: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h3>Hệ thống không tìm thấy thông tin hóa đơn!</h3>
        <p>Vui lòng tiến hành đặt vé phim trước khi thanh toán.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#ff2323', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Quay lại trang chủ</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', padding: '40px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#222', padding: '30px', borderRadius: '10px', border: '1px solid #444' }}>
        <h2 style={{ color: '#ff2323', textAlign: 'center', marginBottom: '20px' }}>XÁC NHẬN THANH TOÁN VÉ PHIM</h2>
        
        {/* Hiển thị chi tiết vé thật */}
        <div style={{ background: '#1b2838', padding: '20px', borderRadius: '5px', marginBottom: '25px', border: '1px solid #107c10' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#107c10' }}>🎬 {movieTitle}</h3>
          <p><b>Suất chiếu:</b> {showtime}</p>
          <p><b>Vị trí ghế:</b> {seatNumber}</p>
          <hr style={{ borderColor: '#444', margin: '15px 0' }} />
          <h3 style={{ color: '#ff2323', margin: '0' }}>Tổng số tiền: {amount?.toLocaleString()} VNĐ</h3>
        </div>

        <p><b>Chọn hình thức giao dịch:</b></p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setPaymentMethod('momo')} style={{ flex: 1, padding: '15px', fontWeight: 'bold', background: paymentMethod === 'momo' ? '#ae217e' : '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Ví MoMo</button>
          <button onClick={() => setPaymentMethod('card')} style={{ flex: 1, padding: '15px', fontWeight: 'bold', background: paymentMethod === 'card' ? '#ff5f00' : '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Thẻ Quốc Tế</button>
        </div>

        <button onClick={handlePaymentSubmit} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#666' : '#ff2323', color: 'white', padding: '15px', fontSize: '18px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? "HỆ THỐNG ĐANG XỬ LÝ..." : "XÁC NHẬN THANH TOÁN CỦA BẠN"}
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;