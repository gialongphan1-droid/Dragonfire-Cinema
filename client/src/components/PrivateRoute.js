import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    console.log("🔒 PrivateRoute check:");
    console.log("   token:", token ? "Có" : "Không");
    console.log("   user:", user);
    console.log("   adminOnly:", adminOnly);
    console.log("   isAdmin:", user.role === "admin");

    if (!token) {
        console.log("❌ Không có token -> redirect login");
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        console.log("❌ Không phải admin -> redirect home");
        return <Navigate to="/" replace />;
    }

    console.log("✅ Truy cập được");
    return children;
};

export default PrivateRoute;