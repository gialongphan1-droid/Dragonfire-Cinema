import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/auth/Home";
import Header from "./pages/Header";
import Footer from "./pages/Footer";

import ShowTimeList from "./pages/showtime/ShowTimeList";
import ShowTimeForm from "./pages/showtime/ShowTimeForm";
import ShowTimeDetails from "./pages/showtime/ShowTimeDetails";
import LichChieu from "./pages/showtime/LichChieu";  // ← THÊM DÒNG NÀY

const PrivateRoute = ({ children }) => {
	const token = localStorage.getItem("token");
	return token ? children : <Navigate to="/login" />;
};

// Tạo component con để dùng useLocation
function AppContent() {
	const location = useLocation();
	const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
	
	return (
		<>
			{!isAuthPage && <Header />}
			<main className="main-content">
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					
					<Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
					
					{/* === ROUTE MỚI CHO LỊCH CHIẾU === */}
					<Route path="/lich-chieu" element={<LichChieu />} />
					
					<Route path="/showtimes" element={<ShowTimeList />} />
					<Route path="/showtimes/:id" element={<ShowTimeDetails />} />
					<Route path="/showtimes/add" element={<PrivateRoute><ShowTimeForm /></PrivateRoute>} />
					<Route path="/showtimes/edit/:id" element={<PrivateRoute><ShowTimeForm /></PrivateRoute>} />
					
					<Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
				</Routes>
			</main>
			{!isAuthPage && <Footer />}
		</>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}

export default App;