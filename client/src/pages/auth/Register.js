import React, { useState } from "react";
import authService from "../../services/authService";
import Header from "../Header";
import Footer from "../Footer";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setLoading(true);

        try {
            const data = await authService.register(name, email, password);
            if (data.success) {
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                window.location.href = "/login";
            } else {
                setError(data.message || "Đăng ký thất bại!");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Đăng ký thất bại!";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Header />
            <main className="register-main">
                <div className="register-card">
                    <h2 className="register-title">ĐĂNG KÝ</h2>

                    {error && <div className="error-message">{error}</div>}

                    <form className="register-form" onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập địa chỉ email"
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
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                        </button>
                    </form>

                    <p className="login-link">
                        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Register;