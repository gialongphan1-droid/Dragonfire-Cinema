# 🚀 HƯỚNG DẪN DỰ ÁN BACKEND - DRAGONFIRE CINEMA

Chào cả nhà, đây là tài liệu hướng dẫn vận hành và quy chuẩn code cho dự án Dragonfire Cinema. Mọi người bắt buộc phải tuân thủ để tránh xung đột code.

---

## 📂 1. CẤU TRÚC THƯ MỤC (MVC Architecture)

Dự án được tổ chức theo mô hình MVC để dễ dàng chia việc cho 6 thành viên:

````text
server/
├── config/         # Cấu hình DB (db.js)
├── controllers/    # Logic xử lý chính (Đại não)
├── middlewares/    # Xác thực & xử lý lỗi
├── models/         # Định nghĩa Schema (Database)
├── routes/         # Định nghĩa URL (Đường dẫn API)
├── utils/          # Hàm tiện ích chung
├── .env            # Biến môi trường (Bảo mật)
├── index.js        # File khởi chạy chính
└── package.json    # Quản lý thư viện

## 📌 2. BẢNG PHÂN CÔNG CÔNG VIỆC

| STT | Thành viên | Chức năng phụ trách | File Models | File Routes |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hiếu** | Đặt vé & Giữ ghế | `Booking.js` | `bookingRoutes.js` |
| **2** | **Kỷ** | Combo bắp nước | `Product.js` | `productRoutes.js` |
| **3** | **Hoàng** | Phòng & Lịch chiếu | `Showtime.js` | `showtimeRoutes.js` |
| **4** | **Lê Long** | Quản lý phim | `Movie.js` | `movieRoutes.js` |
| **5** | **Đạt** | Thanh toán | _(Dùng chung)_ | `paymentRoutes.js` |
| **6** | **Long Phan** | Auth & Điểm thưởng | `User.js` | `authRoutes.js` |

## 🛠️ 3. QUY TRÌNH LÀM VIỆC (Git)
Mở Terminal tại thư mục `server/` và thực hiện theo thứ tự sau để tránh xung đột code:

1. **Chuyển sang nhánh chung:** ```bash
   git checkout dev
2. **Cập nhật code mới nhất từ team:** ```bash
    git pull origin dev

3. **Tạo nhánh tính năng riêng cho bạn:** (Thay <ten-chuc-nang> bằng tên module bạn phụ trách, ví dụ:feature/quan-ly-phim)
    git checkout -b feature/<ten-chuc-nang>

## 🚀 4. THIẾT LẬP MÔI TRƯỜNG LẦN ĐẦU
Cài đặt thư viện:
Bash
    npm install
Tạo file .env trong thư mục server/ và điền nội dung sau:
hỏi nhóm trưởng :)))

Khởi chạy server:
Bash
    npm run dev

💡 5. QUY TẮC VÀNG
MVC: Logic xử lý bắt buộc viết trong controllers/. File routes/ chỉ để định nghĩa URL.

Không sửa index.js: Nếu cần thêm route/middleware, hãy báo với nhóm trưởng.

Commit: Luôn ghi rõ nội dung: git commit -m "feat: mô tả công việc".

Bảo mật: Không bao giờ đẩy file .env lên GitHub (đã có trong .gitignore).
````
