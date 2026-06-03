// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_URL = "http://localhost:5000/api/showtimes";

// // ✅ ĐỔI TÊN HÀM THÀNH ShowTimeList (chữ S hoa)
// const ShowTimeList = () => {
//     const [showtimes, setShowtimes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const isAdmin = user?.isAdmin === true;

//     useEffect(() => {
//         fetchShowtimes();
//     }, []);

//     const fetchShowtimes = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(API_URL);
//             setShowtimes(response.data.data);
//             setError("");
//         } catch (err) {
//             setError("Không thể tải danh sách suất chiếu");
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatTime = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleTimeString("vi-VN", {
//             hour: "2-digit",
//             minute: "2-digit"
//         });
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString("vi-VN", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric"
//         });
//     };

//     if (loading) {
//         return <div className="loading">Đang tải...</div>;
//     }

//     if (error) {
//         return <div className="error-message">{error}</div>;
//     }

//     return (
//         <div className="showtime-container">
//             <h2 className="text-center">🎬 LỊCH CHIẾU PHIM</h2>
            
//             {showtimes.length === 0 ? (
//                 <p className="text-center">Hiện chưa có suất chiếu nào</p>
//             ) : (
//                 showtimes.map((showtime) => (
//                     <div key={showtime._id} className="showtime-item">
//                         <div className="showtime-time">
//                             {formatTime(showtime.startTime)}
//                         </div>
//                         <div className="showtime-movie">
//                             <strong>{showtime.movieTitle}</strong>
//                             <br />
//                             <small>{formatDate(showtime.startTime)}</small>
//                         </div>
//                         <div className="showtime-room">
//                             🏠 {showtime.cinemaName} - {showtime.roomName}
//                         </div>
//                         <div className="showtime-price">
//                             {showtime.price.toLocaleString()}đ
//                         </div>
//                         <div className="showtime-status available">
//                             Còn vé
//                         </div>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// // ✅ Export đúng tên
// export default ShowTimeList;






import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ShowTimeList = () => {
    const navigate = useNavigate();
    
    const [selectedMovie, setSelectedMovie] = useState(null);
    
    // Dùng ảnh từ TMDB - nguồn ổn định nhất cho phim ảnh
    const movies = [
        {
            id: "1",
            title: "AVENGERS: ENDGAME",
            image: "https://image.tmdb.org/t/p/original/8go3YE9sBMQaCXEx23j6BAfeuxd.jpg",
            genre: "Hành động, Phiêu lưu",
            duration: "181 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.4"
        },
        {
            id: "2",
            title: "JOKER",
            image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            genre: "Tâm lý, Tội phạm",
            duration: "122 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.7"
        },
        {
            id: "3",
            title: "INSIDE OUT 2",
            image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg",
            genre: "Hoạt hình, Gia đình",
            duration: "96 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.1"
        },
        {
            id: "4",
            title: "DORAEMON: NOBITA VÀ LÂU ĐÀI DƯỚI ĐÁY BIỂN",
            image: "https://booking.bhdstar.vn/CDN/Image/Entity/FilmPosterGraphic/HO00003530",
            genre: "Hoạt hình, Phiêu lưu",
            duration: "110 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 7.9"
        },
        {
            id: "5",
            title: "DEADPOOL 3",
            image: "https://posterspy.com/wp-content/uploads/2022/10/DEADPOOL-3-POSTER-min.jpg",
            genre: "Hài, Hành động",
            duration: "127 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.2"
        },
        {
            id: "6",
            title: "DUNE: PART TWO",
            image: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
            genre: "Khoa học viễn tưởng",
            duration: "166 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.9"
        },
        {
            id: "7",
            title: "OPPENHEIMER",
            image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            genre: "Tiểu sử, Chính kịch",
            duration: "180 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.8"
        },
        {
            id: "8",
            title: "BARBIE",
            image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
            genre: "Hài, Phiêu lưu",
            duration: "114 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 7.6"
        },
        {
            id: "9",
            title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
            image: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
            genre: "Hoạt hình, Hành động",
            duration: "140 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.7"
        },
        {
            id: "10",
            title: "JOHN WICK: CHAPTER 4",
            image: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
            genre: "Hành động, Giật gân",
            duration: "169 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 8.5"
        },
        {
            id: "11",
            title: "THE MARVELS",
            image: "https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
            genre: "Hành động, Phiêu lưu",
            duration: "105 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 6.8"
        },
        {
            id: "12",
            title: "WONKA",
            image: "https://m.media-amazon.com/images/M/MV5BM2Y1N2ZhNjctYjVhZC00MDg2LWFhNTItMzI3ZjAwZDhjYmFiXkEyXkFqcGc@._V1_.jpg",
            genre: "Nhạc kịch, Gia đình",
            duration: "116 phút",
            cinema: "Dragonfire Cinema",
            rating: "⭐ 7.5"
        }
    ];
    
    const showtimes = {
        "1": [
            { id: "s1", time: "10:00", room: "Phòng A1", price: 85000, date: "25/12" },
            { id: "s2", time: "14:30", room: "Phòng A2", price: 95000, date: "25/12" },
            { id: "s3", time: "19:45", room: "Phòng A1", price: 105000, date: "25/12" }
        ],
        "2": [
            { id: "s4", time: "11:15", room: "Phòng VIP", price: 95000, date: "25/12" },
            { id: "s5", time: "15:45", room: "Phòng VIP", price: 105000, date: "25/12" },
            { id: "s6", time: "20:30", room: "Phòng Thường", price: 85000, date: "25/12" }
        ],
        "3": [
            { id: "s7", time: "09:30", room: "Phòng 3D", price: 120000, date: "25/12" },
            { id: "s8", time: "13:45", room: "Phòng 3D", price: 130000, date: "25/12" },
            { id: "s9", time: "18:15", room: "Phòng 2D", price: 100000, date: "25/12" }
        ],
        "4": [
            { id: "s10", time: "08:50", room: "2D Lồng Tiếng", price: 75000, date: "25/12" },
            { id: "s11", time: "10:20", room: "2D Lồng Tiếng", price: 75000, date: "25/12" },
            { id: "s12", time: "13:10", room: "2D Phụ Đề", price: 75000, date: "25/12" },
            { id: "s13", time: "15:20", room: "2D Phụ Đề", price: 75000, date: "25/12" },
            { id: "s14", time: "18:00", room: "2D Lồng Tiếng", price: 75000, date: "25/12" },
            { id: "s15", time: "20:40", room: "2D Phụ Đề", price: 75000, date: "25/12" }
        ],
        "5": [
            { id: "s16", time: "12:00", room: "Phòng IMAX", price: 150000, date: "26/12" },
            { id: "s17", time: "16:30", room: "Phòng IMAX", price: 160000, date: "26/12" },
            { id: "s18", time: "21:00", room: "Phòng IMAX", price: 170000, date: "26/12" }
        ],
        "6": [
            { id: "s19", time: "13:00", room: "Phòng IMAX", price: 140000, date: "27/12" },
            { id: "s20", time: "17:30", room: "Phòng IMAX", price: 150000, date: "27/12" }
        ],
        "7": [
            { id: "s21", time: "11:00", room: "Phòng A1", price: 95000, date: "26/12" },
            { id: "s22", time: "15:30", room: "Phòng A1", price: 105000, date: "26/12" },
            { id: "s23", time: "20:00", room: "Phòng A1", price: 115000, date: "26/12" }
        ],
        "8": [
            { id: "s24", time: "09:00", room: "Phòng VIP", price: 85000, date: "26/12" },
            { id: "s25", time: "13:30", room: "Phòng VIP", price: 95000, date: "26/12" },
            { id: "s26", time: "18:00", room: "Phòng VIP", price: 105000, date: "26/12" }
        ],
        "9": [
            { id: "s27", time: "10:30", room: "Phòng 3D", price: 110000, date: "27/12" },
            { id: "s28", time: "15:00", room: "Phòng 3D", price: 120000, date: "27/12" },
            { id: "s29", time: "19:30", room: "Phòng 3D", price: 130000, date: "27/12" }
        ],
        "10": [
            { id: "s30", time: "12:30", room: "Phòng A2", price: 95000, date: "27/12" },
            { id: "s31", time: "17:00", room: "Phòng A2", price: 105000, date: "27/12" },
            { id: "s32", time: "21:30", room: "Phòng A2", price: 115000, date: "27/12" }
        ],
        "11": [
            { id: "s33", time: "10:00", room: "Phòng B1", price: 85000, date: "28/12" },
            { id: "s34", time: "14:30", room: "Phòng B1", price: 95000, date: "28/12" },
            { id: "s35", time: "19:00", room: "Phòng B1", price: 105000, date: "28/12" }
        ],
        "12": [
            { id: "s36", time: "09:30", room: "Phòng 2D", price: 80000, date: "28/12" },
            { id: "s37", time: "13:00", room: "Phòng 2D", price: 90000, date: "28/12" },
            { id: "s38", time: "17:30", room: "Phòng 2D", price: 100000, date: "28/12" },
            { id: "s39", time: "20:30", room: "Phòng 2D", price: 100000, date: "28/12" }
        ]
    };

    const handleMovieClick = (movieId) => {
        if (selectedMovie === movieId) {
            setSelectedMovie(null);
        } else {
            setSelectedMovie(movieId);
        }
    };

    return (
        <div className="lich-chieu-container">
            <h1 className="lich-chieu-title">🎬 LỊCH CHIẾU PHIM</h1>
            
            <div className="phim-grid">
                {movies.map((movie) => (
                    <div key={movie.id} className="phim-card">
                        <div 
                            className="phim-image-container"
                            onClick={() => handleMovieClick(movie.id)}
                        >
                            <img 
                                src={movie.image} 
                                alt={movie.title}
                                className="phim-image"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/300x450/e50914/white?text=${encodeURIComponent(movie.title.split(" ")[0])}`;
                                }}
                            />
                            <div className="phim-overlay">
                                <span className="phim-rating">{movie.rating}</span>
                            </div>
                        </div>
                        
                        <div className="phim-info" onClick={() => handleMovieClick(movie.id)}>
                            <h3 className="phim-ten">{movie.title}</h3>
                            <p className="phim-meta">{movie.genre} • {movie.duration}</p>
                            <p className="phim-rap">🏠 {movie.cinema}</p>
                        </div>
                        
                        {selectedMovie === movie.id && (
                            <div className="suat-chieu-container">
                                <div className="suat-chieu-header">
                                    <span className="suat-chieu-title">📅 CHỌN SUẤT CHIẾU</span>
                                </div>
                                {/* ĐÃ SỬA - DÙNG CLASS NGANG */}
                                <div className="suat-chieu-list-ngang">
                                    {showtimes[movie.id]?.map((suat) => (
                                        <div 
                                            key={suat.id}
                                            className="suat-chieu-item-ngang"
                                            onClick={() => navigate(`/datve/${suat.id}`)}
                                        >
                                            <div className="suat-chieu-date-ngang">{suat.date}</div>
                                            <div className="suat-chieu-time-ngang">{suat.time}</div>
                                            <div className="suat-chieu-room-ngang">{suat.room}</div>
                                            <div className="suat-chieu-price-ngang">{suat.price.toLocaleString()}đ</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShowTimeList;





