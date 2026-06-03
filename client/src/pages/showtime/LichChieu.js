import React from "react";
import { useNavigate } from "react-router-dom";

const LichChieu = () => {
    const navigate = useNavigate();

    const phimDangChieu = [
        { 
            id: 1, 
            title: "AVENGERS: ENDGAME", 
            time: ["19:45", "21:30"], 
            room: "Phòng A1", 
            price: "105,000", 
            image: "https://image.tmdb.org/t/p/original/8go3YE9sBMQaCXEx23j6BAfeuxd.jpg",
            color: "#e50914" 
        },
        { 
            id: 2, 
            title: "JOKER", 
            time: ["18:30", "20:45"], 
            room: "Phòng VIP", 
            price: "95,000", 
            image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            color: "#2ecc71" 
        },
        { 
            id: 3, 
            title: "INSIDE OUT 2", 
            time: ["17:30", "19:30"], 
            room: "Phòng 3D", 
            price: "120,000", 
            image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg",
            color: "#3498db" 
        },
        { 
            id: 4, 
            title: "DUNE: PART TWO", 
            time: ["18:00", "21:00"], 
            room: "Phòng IMAX", 
            price: "160,000", 
            image: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
            color: "#f39c12" 
        },
        { 
            id: 5, 
            title: "OPPENHEIMER", 
            time: ["20:00", "22:45"], 
            room: "Phòng A2", 
            price: "115,000", 
            image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            color: "#7f8c8d" 
        },
        { 
            id: 6, 
            title: "BARBIE", 
            time: ["16:30", "19:00"], 
            room: "Phòng VIP", 
            price: "85,000", 
            image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
            color: "#ff69b4" 
        }
    ];

    const handleImageError = (e) => {
        e.target.style.display = "none";
        e.target.parentElement.innerHTML = '<span class="phim-card-fallback">🎬</span>';
    };

    return (
        <div className="lich-chieu-chuyen-nghiep">
            {/* Banner với hình rạp phim */}
            <div className="hero-banner">
                <div 
                    className="hero-bg-cinema" 
                    style={{ backgroundImage: "url('/images/cinema-bg.png')" }}
                ></div>
            </div>

            {/* Banner khuyến mãi + Button đặt vé kế bên */}
            <div className="promo-banner-wrapper">
                <div className="promo-banner">
                    <div className="promo-content">
                        <span className="promo-icon">🎁</span>
                        <span className="promo-text">MUA 2 VÉ TẶNG 1 BẮP NƯỚC</span>
                        <span className="promo-icon">🍿</span>
                    </div>
                    <div className="promo-date">Áp dụng đến 30/12/2024</div>
                </div>
                <button className="promo-datve-btn" onClick={() => navigate("/showtimes")}>
                    🎬 ĐẶT VÉ NGAY
                </button>
            </div>

            {/* Phim đang chiếu */}
            <div className="phim-dang-chieu-section">
                <div className="section-header">
                    <h2 className="section-title">🎬 PHIM ĐANG CHIẾU</h2>
                    <button className="xem-tat-ca-btn" onClick={() => navigate("/showtimes")}>
                        Xem tất cả →
                    </button>
                </div>
                
                <div className="phim-dang-chieu-grid">
                    {phimDangChieu.map((phim) => (
                        <div key={phim.id} className="phim-dang-chieu-card" onClick={() => navigate("/showtimes")}>
                            <div className="phim-card-avatar">
                                <img 
                                    src={phim.image} 
                                    alt={phim.title}
                                    className="phim-card-img-small"
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                            </div>
                            <div className="phim-card-info">
                                <h3 className="phim-card-title">{phim.title}</h3>
                                <div className="phim-card-times">
                                    {phim.time.map((t, i) => (
                                        <span key={i} className="time-chip">{t}</span>
                                    ))}
                                </div>
                                <div className="phim-card-meta">
                                    <span className="phim-room">🎭 {phim.room}</span>
                                    <span className="phim-card-price">{phim.price}đ</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner cuối trang */}
            <div className="footer-banner">
                <div className="footer-banner-content">
                    <span className="footer-banner-icon">⭐</span>
                    <span>ĐẶT VÉ NGAY HÔM NAY - NHẬN NGÀN ƯU ĐÃI</span>
                    <span className="footer-banner-icon">⭐</span>
                </div>
            </div>
        </div>
    );
};

export default LichChieu;