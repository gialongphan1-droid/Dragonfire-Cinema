import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const authService = {
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

	login: async (email, password) => {
		try {
			const response = await axios.post(`${API_URL}/login`, {
				email,
				password,
			});

			console.log("Login response:", response.data);

			if (response.data.success && response.data.data?.token) {
				localStorage.setItem("token", response.data.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}

			return response.data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	},

	getProfile: async () => {
		const token = localStorage.getItem("token");

		if (!token) {
			return { success: false, message: "Chưa đăng nhập" };
		}

		try {
			const response = await axios.get(`${API_URL}/profile`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.data;
		} catch (error) {
			console.error("GetProfile error:", error);
			throw error;
		}
	},

	logout: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/login";
	},

	getCurrentUser: () => {
		const userStr = localStorage.getItem("user");
		if (userStr) {
			return JSON.parse(userStr);
		}
		return null;
	},

	getToken: () => {
		return localStorage.getItem("token");
	},
};

export default authService;
