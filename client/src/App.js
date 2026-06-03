import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

import "./App.css";

// Import các component của Hoàng - Module Showtime
import LichChieu from "./pages/showtime/LichChieu";
import ShowTimeList from "./pages/showtime/ShowTimeList";
import ShowTimeDetails from "./pages/showtime/ShowTimeDetails";
import ShowTimeForm from "./pages/showtime/ShowTimeForm";

// ✅ THÊM IMPORT CHO PHÒNG CHIẾU
import RoomList from "./pages/showtime/RoomList";
import RoomForm from "./pages/showtime/RoomForm";

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: "calc(100vh - 200px)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Movie Routes - Lê Long */}
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
		  <Route path="/showtimes" element={<ShowtimeList />} />
		  <Route path="/booking" element={<Booking />} />

          <Route
            path="/admin/movies"
            element={
              <PrivateRoute adminOnly={true}>
                <MovieAdmin />
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

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;