import React from "react";

const Header = () => {
	const userStr = localStorage.getItem("user");
	const user = userStr ? JSON.parse(userStr) : null;

	const handleLogout = () => {
		if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			window.location.href = "/login";
		}
	};

	return (
		<header className="header">
			<h1 className="logo" onClick={() => (window.location.href = "/")}>
				DRAGONFIRE CINEMA
			</h1>

			<nav className="nav">
				<a href="/movies" className="nav-link">
					Lịch Chiếu
				</a>
				<a href="/showtimes" className="nav-link">
					Suất Chiếu
				</a>
				<a href="/products" className="nav-link">
					Bắp Nước
				</a>

				{user ? (
					<div className="user-info">
						<span className="user-name">Xin chào, {user.name}</span>
						<span className="user-points">{user.points || 0} điểm</span>
						<button className="logout-btn" onClick={handleLogout}>
							Đăng xuất
						</button>
					</div>
				) : (
					<a href="/login" className="login-link">
						Đăng nhập
					</a>
				)}
			</nav>
		</header>
	);
};

export default Header;
