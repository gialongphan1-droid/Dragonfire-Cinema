import React from "react";

const Header = () => {
	return (
		<header
			style={{
				backgroundColor: "var(--surface-color)",
				borderBottom: "2px solid var(--primary-color)",
				padding: "15px 40px",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
			}}
		>
			<h1
				style={{
					color: "var(--primary-color)",
					margin: 0,
					fontSize: "24px",
					letterSpacing: "1px",
					cursor: "pointer",
				}}
				onClick={() => (window.location.href = "/")}
			>
				DRAGONFIRE CINEMA
			</h1>
			<nav style={{ display: "flex", gap: "20px" }}>
				<a href="/movies">Lịch Chiếu</a>
				<a href="/products">Bắp Nước</a>
				<a href="/login" style={{ color: "var(--primary-color)" }}>
					Thành Viên
				</a>
			</nav>
		</header>
	);
};

export default Header;
