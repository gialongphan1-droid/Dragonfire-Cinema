import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./pages/Footer";
import Header from "./pages/Header";
import Home from "./pages/Home";
import VoucherAdmin from "./pages/admin/VoucherAdmin"; // ✅ ĐÚNG
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail"; // ✅ THÊM IMPORT
import VerifyEmailChange from "./pages/auth/VerifyEmailChange";
import Booking from "./pages/booking/Booking";
import MyBookings from "./pages/booking/MyBookings";
import MovieAdmin from "./pages/movie/MovieAdmin";
import MovieDetail from "./pages/movie/MovieDetail";
import MovieList from "./pages/movie/MovieList";
import Payment from "./pages/payment/Payment";
import Devices from "./pages/profile/Devices";
import Profile from "./pages/profile/Profile";
import LichChieu from "./pages/showtime/LichChieu";
import RoomForm from "./pages/showtime/RoomForm";
import RoomList from "./pages/showtime/RoomList";
import ShowTimeDetails from "./pages/showtime/ShowTimeDetails";
import ShowTimeForm from "./pages/showtime/ShowTimeForm";
import ShowtimeAdmin from "./pages/showtime/ShowtimeAdmin";
import ShowtimeList from "./pages/showtime/ShowtimeList";

function App() {
	return (
		<Router>
			<Header />
			<main style={{ minHeight: "calc(100vh - 200px)" }}>
				<Routes>
					<Route
						path="/profile"
						element={
							<PrivateRoute>
								<Profile />
							</PrivateRoute>
						}
					/>
					<Route path="/verify-email-change" element={<VerifyEmailChange />} />
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/verify-email" element={<VerifyEmail />} />{" "}
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/movies" element={<MovieList />} />
					<Route path="/movies/:id" element={<MovieDetail />} />
					<Route path="/showtimes" element={<ShowtimeList />} />
					<Route path="/booking" element={<Booking />} />
					<Route path="/lich-chieu" element={<LichChieu />} />
					<Route path="/showtimes/:id" element={<ShowTimeDetails />} />
					<Route path="/rooms" element={<RoomList />} />
					<Route
						path="/admin/vouchers"
						element={
							<PrivateRoute adminOnly={true}>
								<VoucherAdmin />
							</PrivateRoute>
						}
					/>
					<Route
						path="/devices"
						element={
							<PrivateRoute>
								<Devices />
							</PrivateRoute>
						}
					/>
					{/* Admin Routes - Movies */}
					<Route
						path="/admin/movies"
						element={
							<PrivateRoute adminOnly={true}>
								<MovieAdmin />
							</PrivateRoute>
						}
					/>
					{/* Admin Routes - Showtimes */}
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
					{/* Admin Routes - Rooms */}
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
					{/* Payment & Bookings */}
					<Route
						path="/payment"
						element={
							<PrivateRoute>
								<Payment />
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
