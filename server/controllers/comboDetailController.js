const ComboDetail = require("../models/ComboDetail");

// CREATE
exports.createComboDetail = async (req, res) => {
    try {

        const combo = await ComboDetail.create({
            comboId: req.body.comboId,
            productId: req.body.productId,
            quantity: req.body.quantity
        });

        return res.status(201).json({
            success: true,
            message: "Thêm sản phẩm vào combo thành công",
            data: combo
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// GET ALL
exports.getAllComboDetails = async (req, res) => {
    try {

        const combos = await ComboDetail.find()
            .populate("comboId")
            .populate("productId");

        return res.status(200).json({
            success: true,
            data: combos
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// GET BY COMBO ID
exports.getComboDetailById = async (req, res) => {
    try {

        const combo = await ComboDetail.findById(req.params.id)
            .populate("comboId")
            .populate("productId");

        if (!combo) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dữ liệu combo"
            });
        }

        return res.status(200).json({
            success: true,
            data: combo
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// UPDATE
exports.updateComboDetail = async (req, res) => {
    try {

        const combo = await ComboDetail.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật combo thành công",
            data: combo
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// DELETE
exports.deleteComboDetail = async (req, res) => {
    try {

        await ComboDetail.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Xóa combo thành công"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};