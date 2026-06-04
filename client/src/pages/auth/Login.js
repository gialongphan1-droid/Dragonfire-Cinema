import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Lưu vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // ✅ Kiểm tra role và chuyển hướng
        if (user.role === "admin") {
          navigate("/admin/movies");  // Admin -> trang quản lý phim
        } else {
          navigate("/");  // User thường -> trang chủ
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-main">
        <div className="login-card">
          <h2 className="login-title">ĐĂNG NHẬP</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </button>
          </form>
          <div className="bottom-login-link">
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;