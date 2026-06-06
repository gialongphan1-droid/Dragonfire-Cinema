import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Header = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
	const adminMenuRef = useRef(null);
	const [points, setPoints] = useState(0);

	const fetchUser = async () => {
		const token = localStorage.getItem("accessToken");
		const userStr = localStorage.getItem("user");
		if (token && userStr) {
			const userData = JSON.parse(userStr);
			setUser(userData);
			setPoints(userData.points || 0);

			try {
				const response = await authService.getPoints();
				if (response.success) {
					setPoints(response.data.points);
				}
			} catch (error) {
				console.error("Lấy điểm thất bại:", error);
			}
		} else {
			setUser(null);
			setPoints(0);
		}
	};

	useEffect(() => {
		fetchUser();

		// Lắng nghe sự kiện cập nhật user
		const handleUserUpdate = () => {
			console.log("🔄 User updated, refreshing header...");
			fetchUser();
		};
		window.addEventListener("userUpdated", handleUserUpdate);

		return () => {
			window.removeEventListener("userUpdated", handleUserUpdate);
		};
	}, []);

	// Đóng menu admin khi click ra ngoài
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				adminMenuRef.current &&
				!adminMenuRef.current.contains(event.target)
			) {
				setIsAdminMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("user");
			setUser(null);
			navigate("/login");
		}
	};

	const isAdmin = user?.role === "admin";
	const token = localStorage.getItem("accessToken");

	return (
		<header className="header">
			<h1 className="logo" onClick={() => navigate("/")}>
				DRAGONFIRE CINEMA
			</h1>
			<nav className="nav">
				<Link to="/" className="nav-link">
					Trang chủ
				</Link>
				<Link to="/movies" className="nav-link">
					Phim
				</Link>
				<Link to="/showtimes" className="nav-link">
					Suất chiếu
				</Link>

				{/* Quản lý - Chỉ Admin */}
				{token && isAdmin && (
					<div className="dropdown" ref={adminMenuRef}>
						<button
							className="dropdown-btn nav-link"
							onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
						>
							Quản lý ▼
						</button>
						{isAdminMenuOpen && (
							<div className="dropdown-content">
								<Link
									to="/admin/movies"
									onClick={() => setIsAdminMenuOpen(false)}
								>
									🎬 Quản lý phim
								</Link>
								<Link
									to="/admin/showtimes"
									onClick={() => setIsAdminMenuOpen(false)}
								>
									🕐 Quản lý suất chiếu
								</Link>
								<Link
									to="/admin/vouchers"
									onClick={() => setIsAdminMenuOpen(false)}
								>
									🎫 Quản lý Voucher
								</Link>
							</div>
						)}
					</div>
				)}

				{/* Lịch sử đặt vé */}
				{token && (
					<Link to="/my-bookings" className="nav-link">
						Lịch sử đặt vé
					</Link>
				)}

				{/* Thiết bị */}
				{token && (
					<Link to="/devices" className="nav-link">
						📱 Thiết bị
					</Link>
				)}

				{token ? (
					<div className="user-info">
						<Link to="/profile" className="user-name-link">
							👤 Xin chào, {user?.name || "User"}
						</Link>
						<span className="user-points">⭐ {points} điểm</span>
						<button onClick={handleLogout} className="logout-btn">
							Đăng xuất
						</button>
					</div>
				) : (
					<Link to="/login" className="login-link">
						Đăng nhập
					</Link>
				)}
			</nav>
		</header>
	);
};

export default Header;
