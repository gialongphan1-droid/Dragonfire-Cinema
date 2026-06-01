import React from "react";

const Footer = () => {
	return (
		<footer className="footer">
			<p>
				<span className="footer-logo">DRAGONFIRE CINEMA</span>
				{" © "}
				{new Date().getFullYear()} - Công nghệ Phần mềm
			</p>
			<p className="footer-text">Phát triển bởi Nhóm 8 - Công nghệ Phần mềm</p>
		</footer>
	);
};

export default Footer;
