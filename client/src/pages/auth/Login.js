import React, { useState } from "react";
import authService from "../../services/authService";
import Header from "../Header";
import Footer from "../Footer";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await authService.login(email, password);
            if (data.success) {
                window.location.href = "/home";
            } else {
                setError(data.message || "Đăng nhập thất bại!");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Không thể kết nối đến server!";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Header />
            <main className="login-main">
                <div className="login-card">
                    <h2 className="login-title">ĐĂNG NHẬP</h2>

                    {error && <div className="error-message">{error}</div>}

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
                        </button>
                    </form>

                    <p className="register-link">
                        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Login;