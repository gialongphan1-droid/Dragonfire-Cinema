import React from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/auth/Home";

function App() {
	// Lấy đường dẫn url hiện tại của trình duyệt để fake router đơn giản
	const path = window.location.pathname;

	if (path === "/register") {
		return <Register />;
	}
	if (path === "/home") {
		return <Home />;
	}
	// Mặc định tất cả các đường dẫn khác đều hiển thị trang Login
	return <Login />;
}

export default App;
