# 🚀 HƯỚNG DẪN DỰ ÁN BACKEND - DRAGONFIRE CINEMA

Chào cả nhà, đây là tài liệu hướng dẫn vận hành và quy chuẩn code cho dự án Dragonfire Cinema. Mọi người bắt buộc phải tuân thủ để tránh xung đột code.

---

## 📂 1. CẤU TRÚC THƯ MỤC (MVC Architecture)

Dự án được tổ chức theo mô hình MVC để dễ dàng chia việc cho 6 thành viên:

````text

client/
└── src/
    └── pages/
        ├── auth/        # Long Phan: Module Tài khoản & Thành viên
        ├── movie/       # Lê Long: Module Quản lý thông tin Phim
        ├── showtime/    # Hoàng: Module Quản lý Suất chiếu & Phòng chiếu
        ├── booking/     # Hiếu: Module Đặt vé & Chọn ghế ngồi
        ├── product/     # Kỷ: Module Danh sách gói Combo bắp nước
        ├── payment/     # Đạt: Module Hóa đơn & Thanh toán
        ├── Header.js    # Thành phần thanh thực đơn trên cùng (Dùng chung)
        └── Footer.js    # Thành phần chân trang dưới cùng (Dùng chung)

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

## 📌 2. BẢNG PHÂN CÔNG CÔNG VIỆC TOÀN DIỆN

Để đảm bảo tính đồng bộ, mỗi thành viên sẽ chịu trách nhiệm phát triển trọn gói tính năng từ tầng dữ liệu Backend cho đến giao diện hiển thị Frontend tương ứng của module đó.

| STT | Thành viên | Chức năng phụ trách | File Models (Backend) | File Routes (Backend) | Thư mục trang (Frontend) |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Long Phan** | Auth & Điểm thưởng | `User.js` | `authRoutes.js` | `client/src/pages/auth/` |
| **2** | **Lê Long** | Quản lý phim | `Movie.js` | `movieRoutes.js` | `client/src/pages/movie/` |
| **3** | **Hoàng** | Phòng & Lịch chiếu | `Showtime.js` | `showtimeRoutes.js` | `client/src/pages/showtime/` |
| **4** | **Hiếu** | Đặt vé & Giữ ghế | `Booking.js` | `bookingRoutes.js` | `client/src/pages/booking/` |
| **5** | **Kỷ** | Combo bắp nước | `Product.js` | `productRoutes.js` | `client/src/pages/product/` |
| **6** | **Đạt** | Thanh toán | _(Dùng chung User.js, Booking.js, Showtime.js)_ | `paymentRoutes.js` | `client/src/pages/payment/` |

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
