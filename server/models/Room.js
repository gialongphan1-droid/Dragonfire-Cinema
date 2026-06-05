const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 10,
            max: 200
        },
        type: {
            type: String,
            enum: ["Standard", "VIP", "IMAX", "3D", "4DX"],
            default: "Standard"
        },
        rows: {
            type: Number,
            default: 5,
            min: 2,
            max: 10
        },
        columns: {
            type: Number,
            default: 10,
            min: 5,
            max: 20
        },
        status: {
            type: String,
            enum: ["active", "maintenance", "inactive"],
            default: "active"
        },
        description: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
