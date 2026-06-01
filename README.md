# 🎨 HƯỚNG DẪN CSS CHUNG - DRAGONFIRE CINEMA

## 📌 NGUYÊN TẮC CƠ BẢN

1. **TẤT CẢ CSS tập trung tại 1 file duy nhất:** `client/src/index.css`
2. **KHÔNG dùng inline style** (style={{...}})
3. **KHÔNG tạo file CSS riêng** cho từng component
4. **Dùng className** đã được định nghĩa sẵn
5. **Khi cần class mới, vào trong index.css để tạo** Ctrl + F nhập tên tiếng việt có dấu của mình để tìm phần của mình và thêm vào
6. **Tuyệt đối** không thêm css của mình vào phần của người khác để giữ sạch sẽ phần của người ta

---

# 📂 1. CẤU TRÚC THƯ MỤC (MVC Architecture)

Dự án được tổ chức theo mô hình MVC để dễ dàng chia việc cho 6 thành viên:

```text
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
````

---

---

## 🗂️ BẢNG PHÂN CÔNG CÔNG VIỆC

| STT | Thành viên | Chức năng                | Backend Models                         | Backend Routes      | Frontend Folder   |
| :-: | :--------- | :----------------------- | :------------------------------------- | :------------------ | :---------------- |
|  1  | Long Phan  | Auth & Điểm thưởng       | `User.js`                              | `authRoutes.js`     | `pages/auth/`     |
|  2  | Lê Long    | Quản lý phim             | `Movie.js`                             | `movieRoutes.js`    | `pages/movie/`    |
|  3  | Hoàng      | Suất chiếu & Phòng chiếu | `Showtime.js`                          | `showtimeRoutes.js` | `pages/showtime/` |
|  4  | Hiếu       | Đặt vé & Giữ ghế         | `Booking.js`                           | `bookingRoutes.js`  | `pages/booking/`  |
|  5  | Kỷ         | Combo bắp nước           | `Product.js`                           | `productRoutes.js`  | `pages/product/`  |
|  6  | Đạt        | Thanh toán               | `User.js`, `Booking.js`, `Showtime.js` | `paymentRoutes.js`  | `pages/payment/`  |

---

## 🎨 PHÂN CÔNG CSS (QUAN TRỌNG)

**Tất cả CSS tập trung tại `client/src/index.css`.** Mỗi thành viên chỉ được dùng class được phân công.

### Bảng class CSS theo module

| Thành viên    | Module   | Class được phép dùng                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Long Phan** | Auth     | `.login-container`, `.register-container`, `.home-container`, `.login-card`, `.register-card`, `.login-title`, `.register-title`, `.login-form`, `.register-form`, `.login-btn`, `.register-btn`, `.vip-card`, `.vip-card-title`, `.vip-card-row`, `.vip-card-label`, `.vip-card-rank`, `.vip-card-points`, `.welcome-title`, `.logout-home-btn`, `.bottom-login-link` |
| **Lê Long**   | Movie    | `.movie-grid`, `.movie-card`, `.movie-poster`, `.movie-info`, `.movie-title`, `.movie-duration`                                                                                                                                                                                                                                                                        |
| **Hoàng**     | Showtime | `.showtime-container`, `.showtime-item`, `.showtime-time`                                                                                                                                                                                                                                                                                                              |
| **Hiếu**      | Booking  | `.seat-map`, `.screen`, `.seat-row`, `.seat`, `.seat.available`, `.seat.selected`, `.seat.booked`                                                                                                                                                                                                                                                                      |
| **Kỷ**        | Product  | `.product-grid`, `.product-card`, `.product-price`                                                                                                                                                                                                                                                                                                                     |
| **Đạt**       | Payment  | `.payment-container`, `.payment-methods`, `.payment-method`, `.payment-method.selected`, `.payment-summary`, `.payment-total`                                                                                                                                                                                                                                          |

### Class dùng chung cho tất cả

| Class                                            | Mô tả                                    |
| ------------------------------------------------ | ---------------------------------------- |
| `.header`, `.footer`                             | Header và Footer của trang               |
| `.container`                                     | Container chính, max-width 1200px        |
| `.btn`, `.btn-primary`, `.btn-outline`           | Các loại nút bấm                         |
| `.form-group`, `.form-control`                   | Form nhập liệu                           |
| `.error-message`                                 | Thông báo lỗi (nền đỏ)                   |
| `.loading`                                       | Trạng thái đang tải                      |
| `.text-center`                                   | Căn giữa chữ                             |
| `.text-primary`, `.text-accent`, `.text-success` | Màu chữ                                  |
| `.mt-1` đến `.mt-5`                              | Margin top (5px, 10px, 15px, 20px, 30px) |
| `.mb-1` đến `.mb-5`                              | Margin bottom                            |
| `.flex`, `.flex-between`, `.flex-center`         | Flexbox utilities                        |

### Màu sắc chung (CSS Variables)

````css
:root {
    --primary-color: #e50914;    /* Màu đỏ chủ đạo */
    --primary-dark: #b20710;      /* Màu đỏ đậm */
    --bg-color: #141414;          /* Màu nền chính */
    --surface-color: #1f1f1f;     /* Màu nền thẻ/card */
    --text-primary: #ffffff;      /* Màu chữ chính */
    --text-secondary: #b3b3b3;    /* Màu chữ phụ */
    --accent-color: #ffd700;      /* Màu vàng (điểm thưởng) */
    --error-color: #ff4444;       /* Màu đỏ lỗi */
    --success-color: #4caf50;     /* Màu xanh thành công */
}

## 🛠️ 3. QUY TRÌNH LÀM VIỆC (Git)

Mở Terminal tại **thư mục gốc của dự án** (_Dragonfire Cinema_) và thực hiện theo đúng thứ tự sau để tránh xung đột code khi làm việc nhóm.

### Bước 1: Chuyển sang nhánh chung và cập nhật code mới nhất

```bash id="qlp0gi"
git checkout dev
git pull origin dev
````

### Bước 2: Tạo nhánh tính năng riêng

> Thay `<ten-nhanh>` bằng module bạn phụ trách.
> Ví dụ: `feature/quan-ly-phim`

```bash id="4g6sq9"
git checkout -b feature/<ten-nhanh>
```

### Bước 3: Thực hiện chức năng được phân công

Code và kiểm tra chức năng trên nhánh của mình.

### Bước 4: Commit và đẩy code lên GitHub

```bash id="vv0t6n"
git add .
git commit -m "feat: mô tả công việc ngắn gọn"
git push origin feature/<ten-nhanh>
```

### Ví dụ

```bash id="hlwk9z"
git checkout dev
git pull origin dev

git checkout -b feature/quan-ly-phim

# Sau khi code xong
git add .
git commit -m "feat: thêm chức năng quản lý phim"
git push origin feature/quan-ly-phim
```

### Lưu ý

- Luôn cập nhật nhánh `dev` trước khi tạo nhánh mới.
- Mỗi thành viên làm việc trên nhánh riêng của mình.
- Không commit trực tiếp lên `main`.
- Chỉ merge vào `dev` sau khi kiểm tra code hoàn chỉnh.

---

# 🚀 4. THIẾT LẬP MÔI TRƯỜNG LẦN ĐẦU

## Cài đặt thư viện

```bash
npm install
```

## Tạo file `.env`

Tạo file `.env` trong thư mục `server/` và điền thông tin theo cấu hình được nhóm trưởng cung cấp.

Ví dụ:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Khởi chạy server

```bash
npm run dev
```

---

# 💡 5. QUY TẮC VÀNG

### MVC

Logic xử lý bắt buộc viết trong thư mục `controllers/`.

File `routes/` chỉ dùng để định nghĩa URL.

### Không sửa `index.js`

Nếu cần thêm route hoặc middleware mới, hãy báo với nhóm trưởng.

### Commit

Luôn ghi rõ nội dung commit:

```bash
git commit -m "feat: mô tả công việc"
```

### Bảo mật

Không bao giờ đẩy file `.env` lên GitHub.

File này đã được thêm vào `.gitignore`.

---

# 🛠️ 6. QUY CHUẨN PHẢN HỒI API (Response Standard)

Để Frontend dễ dàng xử lý lỗi và hiển thị thông báo thống nhất, tất cả API phải trả về JSON theo cấu trúc sau.

## Thành công (200, 201)

```json
{
	"success": true,
	"message": "Thêm mới phim thành công!",
	"data": {}
}
```

## Thất bại (400, 401, 403, 404, 500)

```json
{
	"success": false,
	"message": "Tên phim không được để trống hoặc sai định dạng!"
}
```

### Lưu ý

Frontend chỉ cần:

```javascript
alert(error.response.data.message);
```

để hiển thị đúng thông báo lỗi từ Backend.

---

# 💾 7. QUY ĐỊNH LIÊN KẾT DATABASE (Mongoose Schema)

Do hệ thống có nhiều module liên kết với nhau, tất cả khóa ngoại phải sử dụng chuẩn `ObjectId` của MongoDB.

## Liên kết User

```javascript
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
}
```

## Liên kết Showtime

```javascript
showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
}
```

## Liên kết Movie

```javascript
movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
}
```

---

# 🛡️ 8. QUY TẮC VIẾT CODE AN TOÀN (Security)

Hệ thống Core Auth đã được cấu hình các lớp bảo mật nghiêm ngặt. Tất cả thành viên phải tuân thủ các nguyên tắc sau.

## 1. Chống NoSQL Injection

Không truyền trực tiếp dữ liệu từ `req.body` hoặc `req.query` vào truy vấn MongoDB.

### Đúng

```javascript
const name = String(req.body.name || "").trim();

const movie = await Movie.findOne({
	name,
});
```

---

## 2. Ngăn chặn Mass Assignment

Không sử dụng:

```javascript
new Movie(req.body);
```

### Đúng

```javascript
const { title, description, duration } = req.body;

const newMovie = new Movie({
	title,
	description,
	duration,
});

await newMovie.save();
```

---

## 3. Bảo vệ Route nhạy cảm (Admin Only)

Các chức năng quản trị phải sử dụng middleware xác thực và phân quyền.

Ví dụ tạo phim:

```javascript
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.post("/create", verifyToken, isAdmin, movieController.createMovie);
```

---

# ✅ KẾT LUẬN

Mỗi thành viên chỉ được thao tác trong module được phân công.

Trước khi code:

1. Pull code mới nhất từ nhánh `dev`.
2. Tạo nhánh tính năng riêng.
3. Tuân thủ MVC.
4. Tuân thủ chuẩn Response JSON.
5. Tuân thủ quy tắc bảo mật.
6. Không sửa file cấu hình hệ thống khi chưa được thống nhất.

Mọi thay đổi ảnh hưởng đến kiến trúc dự án phải được thông qua nhóm trưởng trước khi triển khai.
