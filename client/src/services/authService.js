import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const authService = {
	// 1. Gửi dữ liệu đăng ký xuống Backend
	register: async (name, email, password) => {
		const response = await axios.post(`${API_URL}/register`, {
			name,
			email,
			password,
		});
		return response.data;
	},

	// 2. Gửi dữ liệu đăng nhập và nhận Token
	login: async (email, password) => {
		const response = await axios.post(`${API_URL}/login`, { email, password });
		if (response.data.success && response.data.token) {
			// Lưu token vào trình duyệt luôn cho tiện
			localStorage.setItem("token", response.data.token);
		}
		return response.data;
	},

	// 3. Lấy thông tin cá nhân bằng Token bảo mật
	getProfile: async () => {
		const token = localStorage.getItem("token");
		if (!token) return null;

		const response = await axios.get(`${API_URL}/profile`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	// 4. Đăng xuất xóa token
	logout: () => {
		localStorage.removeItem("token");
	},
};

export default authService;
