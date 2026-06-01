import React, { useEffect, useState } from "react";
import authService from "../../services/authService";
import Header from "../Header";
import Footer from "../Footer";

const Home = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await authService.getProfile();
                if (data && data.success) {
                    setUser(data.data.user);
                } else {
                    window.location.href = "/login";
                }
            } catch (err) {
                console.error("Lỗi tải profile:", err);
                authService.logout();
                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) {
        return <div className="loading">Đang tải thông tin tài khoản...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="home-container">
            <Header />
            <main className="home-main">
                <h2 className="welcome-title">
                    Chào mừng thành viên, {user.name}!
                </h2>

                <div className="vip-card">
                    <h3 className="vip-card-title">DRAGONFIRE VIP CARD</h3>
                    <hr className="vip-card-divider" />

                    <p className="vip-card-row">
                        <span className="vip-card-label">Hạng thẻ: </span>
                        <span className="vip-card-rank">
                            {user.rank || "THÀNH VIÊN"}
                        </span>
                    </p>

                    <p className="vip-card-row">
                        <span className="vip-card-label">Điểm tích lũy: </span>
                        <span className="vip-card-points">
                            {user.points || 0} điểm
                        </span>
                    </p>

                    <p className="vip-card-email">
                        <span>Email: </span> {user.email}
                    </p>
                </div>

                <button
                    className="logout-home-btn"
                    onClick={() => {
                        authService.logout();
                        window.location.href = "/login";
                    }}
                >
                    Đăng xuất tài khoản
                </button>
            </main>
            <Footer />
        </div>
    );
};

export default Home;