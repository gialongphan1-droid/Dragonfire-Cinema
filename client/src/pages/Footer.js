import React from "react";

const Footer = () => {
	return (
		<footer
			style={{
				backgroundColor: "var(--surface-color)",
				color: "var(--text-secondary)",
				textAlign: "center",
				padding: "20px",
				fontSize: "14px",
				borderTop: "1px solid #222",
				marginTop: "auto",
			}}
		>
			<p>
				© {new Date().getFullYear()} Dragonfire Cinema - Công nghệ Phần mềm{" "}
			</p>
			<p style={{ marginTop: "5px", fontSize: "12px", opacity: 0.6 }}>
				Phát triển bởi Nhóm 8 - Công nghệ Phần mềm
			</p>
		</footer>
	);
};

export default Footer;
