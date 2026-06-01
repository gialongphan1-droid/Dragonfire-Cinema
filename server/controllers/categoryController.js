const Category = require("../models/Category");

// CREATE
exports.createCategory = async (req, res) => {
    try {
        const categoryName = String(req.body.categoryName || "").trim();
        const description = String(req.body.description || "").trim();

        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục không được để trống"
            });
        }

        const existed = await Category.findOne({ categoryName });

        if (existed) {
            return res.status(400).json({
                success: false,
                message: "Danh mục đã tồn tại"
            });
        }

        const category = await Category.create({
            categoryName,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Thêm danh mục thành công",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
exports.getAllCategories = async (req, res) => {
    try {

        const categories = await Category.find();

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY ID
exports.getCategoryById = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE
exports.updateCategory = async (req, res) => {
    try {

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                categoryName: req.body.categoryName,
                description: req.body.description
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật thành công",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
exports.deleteCategory = async (req, res) => {
    try {

        await Category.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Xóa danh mục thành công"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};