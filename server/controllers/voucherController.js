const Voucher = require("../models/Voucher");

const getVouchers = async (req, res) => {
	try {
		const vouchers = await Voucher.find().sort({ createdAt: -1 });
		res.json({ success: true, data: vouchers });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const createVoucher = async (req, res) => {
	try {
		const {
			code,
			name,
			description,
			discountType,
			discountValue,
			applicableTo,
			applicableTicketTypes,
			applicableSeatTypes,
			minOrderValue,
			maxDiscount,
			quantity,
			startDate,
			endDate,
		} = req.body;

		const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
		if (existingVoucher) {
			return res
				.status(400)
				.json({ success: false, message: "Mã voucher đã tồn tại" });
		}

		const voucher = await Voucher.create({
			code: code.toUpperCase(),
			name,
			description: description || "",
			discountType,
			discountValue: Number(discountValue),
			applicableTo: applicableTo || "total",
			applicableTicketTypes: applicableTicketTypes || ["all"],
			applicableSeatTypes: applicableSeatTypes || ["all"],
			minOrderValue: minOrderValue ? Number(minOrderValue) : 0, // ✅ Ép kiểu và gán 0 nếu null
			maxDiscount: maxDiscount ? Number(maxDiscount) : 0, // ✅ Ép kiểu và gán 0 nếu null
			quantity: quantity ? Number(quantity) : 0, // ✅ Ép kiểu và gán 0 nếu null
			startDate,
			endDate,
		});

		res.status(201).json({
			success: true,
			message: "Thêm voucher thành công!",
			data: voucher,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const updateVoucher = async (req, res) => {
	try {
		const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!voucher) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy voucher" });
		}
		res.json({ success: true, message: "Cập nhật thành công!", data: voucher });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const deleteVoucher = async (req, res) => {
	try {
		const voucher = await Voucher.findByIdAndDelete(req.params.id);
		if (!voucher) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy voucher" });
		}
		res.json({ success: true, message: "Xóa voucher thành công!" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// 🔥 QUAN TRỌNG: Hàm tính giảm giá CHÍNH XÁC theo đối tượng
const calculateDiscount = (voucher, orderValue, ticketItems, seatItems) => {
	let discountAmount = 0;
	let applicableValue = 0;

	switch (voucher.applicableTo) {
		case "total":
			// Giảm trên tổng hóa đơn
			applicableValue = orderValue;
			break;

		case "ticket":
			// Chỉ tính trên giá vé (không bao gồm ghế)
			applicableValue = ticketItems.reduce((sum, item) => sum + item.price, 0);
			break;

		case "seat":
			// Chỉ tính trên giá ghế (không bao gồm vé)
			applicableValue = seatItems.reduce((sum, item) => sum + item.price, 0);
			break;

		default:
			applicableValue = orderValue;
	}

	if (applicableValue <= 0) return 0;

	// Tính giảm giá theo loại
	if (voucher.discountType === "percent") {
		discountAmount = (applicableValue * voucher.discountValue) / 100;
		if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
			discountAmount = voucher.maxDiscount;
		}
	} else if (voucher.discountType === "final_price") {
		discountAmount = applicableValue - voucher.discountValue;
		if (discountAmount < 0) discountAmount = 0;
	} else {
		// fixed
		discountAmount = voucher.discountValue;
		if (discountAmount > applicableValue) discountAmount = applicableValue;
	}

	return discountAmount;
};

// 🔥 QUAN TRỌNG: Hàm kiểm tra loại vé/ghế có được áp dụng không
const isApplicable = (voucher, ticketTypes, seatTypes) => {
	if (voucher.applicableTo === "total") return true;

	if (voucher.applicableTo === "ticket") {
		const allowedTypes = voucher.applicableTicketTypes;
		if (allowedTypes.includes("all")) return true;
		if (!ticketTypes || ticketTypes.length === 0) return false;
		return ticketTypes.some((type) => allowedTypes.includes(type));
	}

	if (voucher.applicableTo === "seat") {
		const allowedSeatTypes = voucher.applicableSeatTypes;
		if (allowedSeatTypes.includes("all")) return true;
		if (!seatTypes || seatTypes.length === 0) return false;
		return seatTypes.some((type) => allowedSeatTypes.includes(type));
	}

	return false;
};

// @desc    Kiểm tra voucher (cho user)
// @route   POST /api/vouchers/validate
// @access  Private
const validateVoucher = async (req, res) => {
	try {
		const {
			code,
			orderValue,
			ticketTypes, // Danh sách loại vé đã chọn: ["adult", "student"]
			seatTypes, // 🔥 MỚI: Danh sách loại ghế đã chọn: ["vip", "normal"]
			ticketItems, // 🔥 MỚI: Chi tiết từng vé: [{type: "adult", price: 69000}]
			seatItems, // 🔥 MỚI: Chi tiết từng ghế: [{type: "vip", price: 120000}]
		} = req.body;

		const voucher = await Voucher.findOne({ code: code.toUpperCase() });

		if (!voucher) {
			return res
				.status(404)
				.json({ success: false, message: "Mã voucher không tồn tại" });
		}

		// Kiểm tra thời gian
		const now = new Date();
		if (now < voucher.startDate) {
			return res
				.status(400)
				.json({ success: false, message: "Voucher chưa có hiệu lực" });
		}
		if (now > voucher.endDate) {
			return res
				.status(400)
				.json({ success: false, message: "Voucher đã hết hạn" });
		}
		if (voucher.status !== "active") {
			return res
				.status(400)
				.json({ success: false, message: "Voucher không hoạt động" });
		}
		if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
			return res
				.status(400)
				.json({ success: false, message: "Voucher đã hết số lượng" });
		}

		// 🔥 KIỂM TRA LOẠI VÉ/GHẾ CÓ ĐƯỢC ÁP DỤNG KHÔNG
		const applicable = isApplicable(voucher, ticketTypes, seatTypes);
		if (!applicable) {
			let message = "";
			if (voucher.applicableTo === "ticket") {
				message = "Voucher này không áp dụng cho loại vé đã chọn!";
			} else if (voucher.applicableTo === "seat") {
				message = "Voucher này không áp dụng cho loại ghế đã chọn!";
			} else {
				message = "Voucher không áp dụng được!";
			}
			return res.status(400).json({ success: false, message });
		}

		// Kiểm tra giá trị đơn hàng tối thiểu (chỉ kiểm tra nếu áp dụng cho total)
		if (
			voucher.applicableTo === "total" &&
			orderValue < voucher.minOrderValue
		) {
			return res.status(400).json({
				success: false,
				message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`,
			});
		}

		// 🔥 TÍNH GIẢM GIÁ CHÍNH XÁC
		const discountAmount = calculateDiscount(
			voucher,
			orderValue,
			ticketItems || [],
			seatItems || [],
		);

		if (discountAmount <= 0 && voucher.discountType !== "final_price") {
			return res.status(400).json({
				success: false,
				message: "Voucher không thể áp dụng cho đơn hàng này",
			});
		}

		// Trả về kết quả chi tiết
		let finalAmount = orderValue - discountAmount;
		if (finalAmount < 0) finalAmount = 0;

		// 🔥 TRẢ VỀ CHI TIẾT GIẢM GIÁ CHO TỪNG KHOẢN MỤC (nếu cần)
		let discountBreakdown = null;
		if (voucher.applicableTo === "ticket" && ticketItems) {
			discountBreakdown = {
				type: "ticket",
				items: ticketItems.map((item) => ({
					...item,
					discountRatio:
						discountAmount /
						(ticketItems.reduce((s, i) => s + i.price, 0) || 1),
				})),
			};
		} else if (voucher.applicableTo === "seat" && seatItems) {
			discountBreakdown = {
				type: "seat",
				items: seatItems.map((item) => ({
					...item,
					discountRatio:
						discountAmount / (seatItems.reduce((s, i) => s + i.price, 0) || 1),
				})),
			};
		}

		res.json({
			success: true,
			message: "Voucher hợp lệ!",
			voucher: {
				code: voucher.code,
				name: voucher.name,
				discountType: voucher.discountType,
				discountValue: voucher.discountValue,
				applicableTo: voucher.applicableTo,
				applicableTicketTypes: voucher.applicableTicketTypes,
				applicableSeatTypes: voucher.applicableSeatTypes,
			},
			discountAmount: discountAmount,
			finalAmount: finalAmount,
			discountBreakdown: discountBreakdown, // 🔥 Chi tiết giảm cho từng món
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getVouchers,
	createVoucher,
	updateVoucher,
	deleteVoucher,
	validateVoucher,
};
