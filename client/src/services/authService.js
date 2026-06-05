import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Tạo axios instance với interceptors để xử lý refresh token
const axiosInstance = axios.create({
	baseURL: API_URL,
});

// Flag để tránh gọi refresh token nhiều lần
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor - xử lý token hết hạn
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return axiosInstance(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			isRefreshing = true;
			const refreshToken = localStorage.getItem("refreshToken");

			try {
				const response = await axios.post(`${API_URL}/refresh-token`, {
					refreshToken,
				});

				if (response.data.success) {
					const { accessToken } = response.data;
					localStorage.setItem("accessToken", accessToken);

					processQueue(null, accessToken);
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
					return axiosInstance(originalRequest);
				} else {
					processQueue(new Error("Refresh token failed"), null);
					authService.logout();
					return Promise.reject(error);
				}
			} catch (refreshError) {
				processQueue(refreshError, null);
				authService.logout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

const authService = {
	// ============ ĐĂNG KÝ ============
	register: async (name, email, password) => {
		try {
			const response = await axios.post(`${API_URL}/register`, {
				name,
				email,
				password,
			});
			console.log("Register response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Register error:", error);
			throw error;
		}
	},

	// ============ XÁC THỰC EMAIL ============
	verifyEmail: async (token) => {
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { token });
			return response.data;
		} catch (error) {
			console.error("Verify email error:", error);
			throw error;
		}
	},

	// ============ ĐĂNG NHẬP ============
	login: async (email, password) => {
		try {
			const response = await axios.post(`${API_URL}/login`, {
				email,
				password,
			});

			console.log("Login response:", response.data);

			if (response.data.success && response.data.data?.accessToken) {
				localStorage.setItem("accessToken", response.data.data.accessToken);
				localStorage.setItem("refreshToken", response.data.data.refreshToken);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}

			return response.data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	},

	// ============ QUÊN MẬT KHẨU ============
	forgotPassword: async (email) => {
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, {
				email,
			});
			return response.data;
		} catch (error) {
			console.error("Forgot password error:", error);
			throw error;
		}
	},

	// ============ ĐẶT LẠI MẬT KHẨU ============
	resetPassword: async (token, password) => {
		try {
			const response = await axios.post(`${API_URL}/reset-password`, {
				token,
				password,
			});
			return response.data;
		} catch (error) {
			console.error("Reset password error:", error);
			throw error;
		}
	},

	// ============ ĐỔI MẬT KHẨU (khi đã đăng nhập) ============
	changePassword: async (oldPassword, newPassword) => {
		try {
			const response = await axiosInstance.post(`/change-password`, {
				oldPassword,
				newPassword,
			});
			return response.data;
		} catch (error) {
			console.error("Change password error:", error);
			throw error;
		}
	},

	// ============ LẤY PROFILE ============
	getProfile: async () => {
		const token = localStorage.getItem("accessToken");

		if (!token) {
			return { success: false, message: "Chưa đăng nhập" };
		}

		try {
			const response = await axiosInstance.get(`/profile`);
			return response.data;
		} catch (error) {
			console.error("GetProfile error:", error);
			throw error;
		}
	},

	// ============ CẬP NHẬT PROFILE ============
	updateProfile: async (name, email) => {
		try {
			const response = await axiosInstance.put(`/profile`, { name, email });
			if (response.data.success && response.data.data?.user) {
				const currentUser = authService.getCurrentUser();
				const updatedUser = { ...currentUser, ...response.data.data.user };
				localStorage.setItem("user", JSON.stringify(updatedUser));
			}
			return response.data;
		} catch (error) {
			console.error("UpdateProfile error:", error);
			throw error;
		}
	},

	// ============ LẤY ĐIỂM THƯỞNG ============
	getPoints: async () => {
		try {
			const response = await axiosInstance.get(`/points`);
			return response.data;
		} catch (error) {
			console.error("GetPoints error:", error);
			throw error;
		}
	},

	// ============ ĐĂNG XUẤT ============
	logout: async () => {
		const refreshToken = localStorage.getItem("refreshToken");
		if (refreshToken) {
			try {
				await axios.post(`${API_URL}/logout`, { refreshToken });
			} catch (error) {
				console.error("Logout API error:", error);
			}
		}
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
		window.location.href = "/login";
	},

	// ============ ĐĂNG XUẤT TẤT CẢ THIẾT BỊ ============
	logoutAllDevices: async () => {
		try {
			const response = await axiosInstance.post(`/logout-all`);
			if (response.data.success) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
				window.location.href = "/login";
			}
			return response.data;
		} catch (error) {
			console.error("Logout all devices error:", error);
			throw error;
		}
	},

	// ============ REFRESH TOKEN THỦ CÔNG ============
	refreshToken: async () => {
		const refreshToken = localStorage.getItem("refreshToken");
		if (!refreshToken) {
			return { success: false };
		}
		try {
			const response = await axios.post(`${API_URL}/refresh-token`, {
				refreshToken,
			});
			if (response.data.success && response.data.accessToken) {
				localStorage.setItem("accessToken", response.data.accessToken);
			}
			return response.data;
		} catch (error) {
			console.error("Refresh token error:", error);
			authService.logout();
			return { success: false };
		}
	},

	// ============ LẤY THÔNG TIN USER HIỆN TẠI ============
	getCurrentUser: () => {
		const userStr = localStorage.getItem("user");
		if (userStr) {
			return JSON.parse(userStr);
		}
		return null;
	},

	// ============ LẤY ACCESS TOKEN ============
	getToken: () => {
		return localStorage.getItem("accessToken");
	},

	// ============ LẤY REFRESH TOKEN ============
	getRefreshToken: () => {
		return localStorage.getItem("refreshToken");
	},

	// ============ KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA ============
	isAuthenticated: () => {
		return !!localStorage.getItem("accessToken");
	},

	// ============ LẤY DANH SÁCH THIẾT BỊ ============
	getDevices: async () => {
		try {
			const response = await axiosInstance.get(`/devices`);
			return response.data;
		} catch (error) {
			console.error("Get devices error:", error);
			throw error;
		}
	},

	// ============ THU HỒI THIẾT BỊ ============
	revokeDevice: async (deviceId) => {
		try {
			const response = await axiosInstance.delete(`/devices/${deviceId}`);
			return response.data;
		} catch (error) {
			console.error("Revoke device error:", error);
			throw error;
		}
	},
};

export default authService;
