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
import Booking from "./pages/booking/Booking";

// Import các component của Hoàng - Module Showtime
import LichChieu from "./pages/showtime/LichChieu";
import ShowTimeList from "./pages/showtime/ShowtimeList";  // ← ĐÃ SỬA
import ShowTimeDetails from "./pages/showtime/ShowTimeDetails";
import ShowTimeForm from "./pages/showtime/ShowTimeForm";
import RoomList from "./pages/showtime/RoomList";
import RoomForm from "./pages/showtime/RoomForm";

import "./App.css";

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
          <Route
            path="/admin/movies"
            element={
              <PrivateRoute adminOnly={true}>
                <MovieAdmin />
              </PrivateRoute>
            }
          />

          {/* Showtime Routes - Hoàng */}
          <Route path="/lich-chieu" element={<LichChieu />} />
          <Route path="/showtimes" element={<ShowTimeList />} />
          <Route path="/showtimes/:id" element={<ShowTimeDetails />} />
          <Route path="/showtimes/add" element={<PrivateRoute adminOnly={true}><ShowTimeForm /></PrivateRoute>} />
          <Route path="/showtimes/edit/:id" element={<PrivateRoute adminOnly={true}><ShowTimeForm /></PrivateRoute>} />
          
          {/* Admin Showtime */}
          <Route
            path="/admin/showtimes"
            element={
              <PrivateRoute adminOnly={true}>
                <ShowtimeAdmin />
              </PrivateRoute>
            }
          />

          {/* Room Routes - Hoàng */}
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/add" element={<PrivateRoute adminOnly={true}><RoomForm /></PrivateRoute>} />
          <Route path="/rooms/edit/:id" element={<PrivateRoute adminOnly={true}><RoomForm /></PrivateRoute>} />

          {/* Booking Routes - Hiếu */}
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;