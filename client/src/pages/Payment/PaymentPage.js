import React, { useState } from 'react';

function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('momo');

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', padding: '40px', minHeight: '100vh', textAlign: 'center' }}>
      <h1>TRANG THANH TOÁN DRAGONFIRE CINEMA</h1>
      <p>Cảm ơn Đạt đã chọn xem phim tại rạp!</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setPaymentMethod('momo')}
          style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: paymentMethod === 'momo' ? '#ae217e' : '#444', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Thanh toán qua MoMo
        </button>
        <button 
          onClick={() => setPaymentMethod('card')}
          style={{ padding: '10px 20px', backgroundColor: paymentMethod === 'card' ? '#ff5f00' : '#444', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Thanh toán qua Thẻ
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button style={{ backgroundColor: 'red', color: 'white', padding: '15px 40px', fontSize: '18px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          THANH TOÁN NGAY
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;