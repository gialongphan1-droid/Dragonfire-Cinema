import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MovieList from "./pages/movie/MovieList";
import MovieDetail from "./pages/movie/MovieDetail";
import MovieAdmin from "./pages/movie/MovieAdmin";
import PrivateRoute from "./components/PrivateRoute";
import ShowtimeAdmin from "./pages/showtime/ShowtimeAdmin";
import ShowtimeList from "./pages/showtime/ShowtimeList";
import Booking from "./pages/booking/Booking";
import MyBookings from "./pages/booking/MyBookings";
import VoucherAdmin from "./pages/voucher/VoucherAdmin";

import LichChieu from "./pages/showtime/LichChieu";
import RoomList from "./pages/showtime/RoomList";
import RoomForm from "./pages/showtime/RoomForm";
import ShowTimeDetails from "./pages/showtime/ShowTimeDetails";
import ShowTimeForm from "./pages/showtime/ShowTimeForm";
import "./App.css";

function App() {
	return (
		<Router>
			<Header />
			<main style={{ minHeight: "calc(100vh - 200px)" }}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/movies" element={<MovieList />} />
					<Route path="/movies/:id" element={<MovieDetail />} />
					<Route path="/showtimes" element={<ShowtimeList />} />
					<Route path="/booking" element={<Booking />} />

					{/* ✅ THÊM ROUTE CHO PRODUCTS (COMBO) */}
					<Route
						path="/products"
						element={
							<div style={{ padding: "60px 20px", textAlign: "center" }}>
								<h2 style={{ color: "var(--primary-color)" }}>
									🍿 Combo Bắp Nước
								</h2>
								<p
									style={{ color: "var(--text-secondary)", marginTop: "20px" }}
								>
									Tính năng đang được phát triển...
								</p>
								<button
									className="btn btn-primary"
									style={{ marginTop: "30px" }}
									onClick={() => (window.location.href = "/")}
								>
									Quay lại trang chủ
								</button>
							</div>
						}
					/>

					<Route
						path="/admin/movies"
						element={
							<PrivateRoute adminOnly={true}>
								<MovieAdmin />
							</PrivateRoute>
						}
					/>

					<Route
						path="/admin/vouchers"
						element={
							<PrivateRoute adminOnly={true}>
								<VoucherAdmin />
							</PrivateRoute>
						}
					/>

					<Route path="/lich-chieu" element={<LichChieu />} />
					<Route path="/showtimes/:id" element={<ShowTimeDetails />} />
					<Route
						path="/showtimes/add"
						element={
							<PrivateRoute adminOnly={true}>
								<ShowTimeForm />
							</PrivateRoute>
						}
					/>
					<Route
						path="/showtimes/edit/:id"
						element={
							<PrivateRoute adminOnly={true}>
								<ShowTimeForm />
							</PrivateRoute>
						}
					/>
					<Route
						path="/admin/showtimes"
						element={
							<PrivateRoute adminOnly={true}>
								<ShowtimeAdmin />
							</PrivateRoute>
						}
					/>
					<Route path="/rooms" element={<RoomList />} />
					<Route
						path="/rooms/add"
						element={
							<PrivateRoute adminOnly={true}>
								<RoomForm />
							</PrivateRoute>
						}
					/>
					<Route
						path="/rooms/edit/:id"
						element={
							<PrivateRoute adminOnly={true}>
								<RoomForm />
							</PrivateRoute>
						}
					/>

					<Route
						path="/my-bookings"
						element={
							<PrivateRoute>
								<MyBookings />
							</PrivateRoute>
						}
					/>
				</Routes>
			</main>
			<Footer />
		</Router>
	);
}

export default App;
