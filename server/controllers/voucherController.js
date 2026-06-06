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
            minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
            quantity: quantity ? Number(quantity) : 0,
            startDate,
            endDate,
            status: "active",  // ✅ THÊM
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

const calculateDiscount = (voucher, orderValue, ticketItems, seatItems) => {
    let discountAmount = 0;
    let applicableValue = 0;

    switch (voucher.applicableTo) {
        case "total":
            applicableValue = orderValue;
            break;
        case "ticket":
            applicableValue = ticketItems.reduce((sum, item) => sum + (item.price || 0), 0);
            break;
        case "seat":
            applicableValue = seatItems.reduce((sum, item) => sum + (item.price || 0), 0);
            break;
        default:
            applicableValue = orderValue;
    }

    if (applicableValue <= 0) return 0;

    if (voucher.discountType === "percent") {
        discountAmount = (applicableValue * voucher.discountValue) / 100;
        if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
            discountAmount = voucher.maxDiscount;
        }
    } else if (voucher.discountType === "final_price") {
        discountAmount = applicableValue - voucher.discountValue;
        if (discountAmount < 0) discountAmount = 0;
    } else {
        discountAmount = voucher.discountValue;
        if (discountAmount > applicableValue) discountAmount = applicableValue;
    }

    return Math.floor(discountAmount);
};

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

const validateVoucher = async (req, res) => {
    try {
        const {
            code,
            orderValue,
            ticketTypes = [],
            seatTypes = [],
            ticketItems = [],
            seatItems = [],
        } = req.body;

        console.log("🔍 Kiểm tra voucher:", { code, orderValue });

        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res
                .status(404)
                .json({ success: false, message: "Mã voucher không tồn tại" });
        }

        console.log("✅ Tìm thấy voucher:", voucher.code);

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

        // Kiểm tra giá trị tối thiểu theo đúng đối tượng
        let valueToCheck = orderValue;
        if (voucher.applicableTo === "ticket") {
            valueToCheck = ticketItems.reduce((sum, item) => sum + (item.price || 0), 0);
        } else if (voucher.applicableTo === "seat") {
            valueToCheck = seatItems.reduce((sum, item) => sum + (item.price || 0), 0);
        }

        if (voucher.minOrderValue > 0 && valueToCheck < voucher.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Giá trị ${voucher.applicableTo === "ticket" ? "vé" : voucher.applicableTo === "seat" ? "ghế" : "đơn hàng"} tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`,
            });
        }

        const discountAmount = calculateDiscount(voucher, orderValue, ticketItems, seatItems);

        if (discountAmount <= 0 && voucher.discountType !== "final_price") {
            return res.status(400).json({
                success: false,
                message: "Voucher không thể áp dụng cho đơn hàng này",
            });
        }

        let finalAmount = orderValue - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        // ✅ TĂNG usedCount
        await Voucher.updateOne(
            { _id: voucher._id },
            { $inc: { usedCount: 1 } }
        );

        console.log("💰 Kết quả:", { discountAmount, finalAmount });

        res.json({
            success: true,
            message: "Voucher hợp lệ!",
            code: voucher.code,
            name: voucher.name,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
        });
    } catch (error) {
        console.error("Lỗi validate voucher:", error);
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