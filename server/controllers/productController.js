const Product = require("../models/Product");

// CREATE
exports.createProduct = async (req, res) => {
    try {

        const {
            categoryId,
            productName,
            price,
            quantity,
            size,
            image,
            description
        } = req.body;

        if (!productName) {
            return res.status(400).json({
                success: false,
                message: "Tên sản phẩm không được để trống"
            });
        }

        const product = await Product.create({
            categoryId,
            productName,
            price,
            quantity,
            size,
            image,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Thêm sản phẩm thành công",
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
exports.getAllProducts = async (req, res) => {
    try {

        const products = await Product.find()
            .populate("categoryId");

        return res.status(200).json({
            success: true,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY ID
exports.getProductById = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)
            .populate("categoryId");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE
exports.updateProduct = async (req, res) => {
    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
exports.deleteProduct = async (req, res) => {
    try {

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};