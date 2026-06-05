import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
	const adminMenuRef = useRef(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const userStr = localStorage.getItem("user");
		if (token && userStr) {
			setUser(JSON.parse(userStr));
		}
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
				setIsAdminMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login");
	};

	const isAdmin = user?.role === "admin";
	const token = localStorage.getItem("token");

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
				<Link to="/products" className="nav-link">
					Combo
				</Link>

				{/* Dropdown Quản lý - Chỉ hiển thị với admin */}
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
								<Link to="/admin/movies" onClick={() => setIsAdminMenuOpen(false)}>
									🎬 Quản lý phim
								</Link>
								<Link to="/admin/showtimes" onClick={() => setIsAdminMenuOpen(false)}>
									🕐 Quản lý suất chiếu
								</Link>
								<Link to="/admin/vouchers" onClick={() => setIsAdminMenuOpen(false)}>
									🎫 Quản lý Voucher
								</Link>
								{/* ✅ ĐÃ XÓA "Quản lý phòng chiếu" */}
								<Link to="/admin/products" onClick={() => setIsAdminMenuOpen(false)}>
									🍿 Quản lý combo
								</Link>
							</div>
						)}
					</div>
				)}

				{/* Lịch sử đặt vé - hiển thị với cả user và admin */}
				{token && (
					<Link to="/my-bookings" className="nav-link">
						Lịch sử đặt vé
					</Link>
				)}

				{token ? (
					<div className="user-info">
						<span className="user-name">Xin chào, {user?.name || "User"}</span>
						{user?.points !== undefined && (
							<span className="user-points">⭐ {user.points} điểm</span>
						)}
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