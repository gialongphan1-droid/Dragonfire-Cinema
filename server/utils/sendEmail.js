const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Gửi email xác thực tài khoản khi đăng ký
const sendVerificationEmail = async (email, name, token) => {
	const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

	const mailOptions = {
		from: `"Dragonfire Cinema" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Xác thực tài khoản - Dragonfire Cinema",
		html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #e50914;">Chào mừng ${name}!</h2>
                <p>Vui lòng click vào nút bên dưới để xác thực tài khoản:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #e50914; color: white; text-decoration: none; border-radius: 5px;">Xác thực ngay</a>
                <p>Hoặc copy link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Link có hiệu lực trong 1 giờ.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">Dragonfire Cinema - Trải nghiệm điện ảnh đẳng cấp</p>
            </div>
        `,
	};

	await transporter.sendMail(mailOptions);
};

// Gửi email đặt lại mật khẩu
const sendResetPasswordEmail = async (email, name, token) => {
	const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

	const mailOptions = {
		from: `"Dragonfire Cinema" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Đặt lại mật khẩu - Dragonfire Cinema",
		html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #e50914;">Xin chào ${name}!</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #e50914; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
                <p>Hoặc copy link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>Link có hiệu lực trong 1 giờ.</p>
                <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">Dragonfire Cinema - Trải nghiệm điện ảnh đẳng cấp</p>
            </div>
        `,
	};

	await transporter.sendMail(mailOptions);
};

// ✅ THÊM HÀM MỚI: Gửi email xác thực đổi email
const sendEmailChangeVerification = async (newEmail, name, token) => {
	const verificationUrl = `${process.env.CLIENT_URL}/verify-email-change?token=${token}`;

	const mailOptions = {
		from: `"Dragonfire Cinema" <${process.env.EMAIL_USER}>`,
		to: newEmail,
		subject: "Xác thực đổi email - Dragonfire Cinema",
		html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #e50914;">Xin chào ${name}!</h2>
                <p>Bạn đã yêu cầu đổi email tài khoản Dragonfire Cinema sang địa chỉ này.</p>
                <p><strong>Email cũ:</strong> sẽ được cập nhật thành <strong>${newEmail}</strong></p>
                <p>Vui lòng click vào nút bên dưới để xác nhận đổi email:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #e50914; color: white; text-decoration: none; border-radius: 5px;">Xác nhận đổi email</a>
                <p>Hoặc copy link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Link có hiệu lực trong 1 giờ.</p>
                <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">Dragonfire Cinema - Trải nghiệm điện ảnh đẳng cấp</p>
            </div>
        `,
	};

	await transporter.sendMail(mailOptions);
};

module.exports = {
	sendVerificationEmail,
	sendResetPasswordEmail,
	sendEmailChangeVerification, // ✅ EXPORT HÀM MỚI
};
