import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="header">
      <h1 className="logo" onClick={() => navigate("/")}>
        DRAGONFIRE CINEMA
      </h1>
      <nav className="nav">
        <Link to="/" className="nav-link">Trang chủ</Link>
        <Link to="/movies" className="nav-link">Phim</Link>
        <Link to="/showtimes" className="nav-link">Suất chiếu</Link>
        <Link to="/products" className="nav-link">Combo</Link>
        
        {/* Chỉ hiển thị với admin */}
        {token && user.role === "admin" && (
          <Link to="/admin/movies" className="nav-link" style={{ color: "#e50914" }}>
            👑 Quản lý phim
          </Link>
        )}
        
        {token ? (
          <div className="user-info">
            <span className="user-name">Xin chào, {user.name || "User"}</span>
            {user.points && <span className="user-points">⭐ {user.points} điểm</span>}
            <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
          </div>
        ) : (
          <Link to="/login" className="login-link">Đăng nhập</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;