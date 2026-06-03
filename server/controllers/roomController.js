const Room = require("../models/Room");

// @desc    Lấy tất cả phòng chiếu
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy chi tiết phòng theo ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phòng chiếu"
            });
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo phòng chiếu mới
// @route   POST /api/rooms
// @access  Admin only
exports.createRoom = async (req, res) => {
    try {
        const { name, capacity, type, rows, columns, description, amenities } = req.body;

        // Kiểm tra tên phòng đã tồn tại chưa
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "Tên phòng đã tồn tại"
            });
        }

        const room = await Room.create({
            name,
            capacity,
            type,
            rows: rows || 5,
            columns: columns || 10,
            description,
            amenities: amenities || []
        });

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cập nhật phòng chiếu
// @route   PUT /api/rooms/:id
// @access  Admin only
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phòng chiếu"
            });
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa phòng chiếu
// @route   DELETE /api/rooms/:id
// @access  Admin only
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phòng chiếu"
            });
        }
        res.status(200).json({
            success: true,
            message: "Xóa phòng chiếu thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy danh sách loại phòng
// @route   GET /api/rooms/types
// @access  Public
exports.getRoomTypes = async (req, res) => {
    try {
        const types = ["Standard", "VIP", "IMAX", "3D", "4DX"];
        res.status(200).json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};