const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		capacity: {
			type: Number,
			required: true,
			min: 10,
			max: 200,
		},
		type: {
			type: String,
			enum: ["Standard", "VIP", "IMAX", "3D", "4DX"],
			default: "Standard",
		},
		rows: {
			type: Number,
			default: 5,
			min: 2,
			max: 10,
		},
		columns: {
			type: Number,
			default: 10,
			min: 5,
			max: 20,
		},
		status: {
			type: String,
			enum: ["active", "maintenance", "inactive"],
			default: "active",
		},
		description: {
			type: String,
			default: "",
		},
		seatMap: {
			type: [[String]],
			default: [],
		},
	},
	{ timestamps: true },
);

// ✅ TỰ ĐỘNG TẠO SEAT MAP TRƯỚC KHI LƯU
RoomSchema.pre("save", function (next) {
	if (
		this.rows &&
		this.columns &&
		(!this.seatMap || this.seatMap.length === 0)
	) {
		const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
		const seatMap = [];
		for (let i = 0; i < this.rows; i++) {
			const row = [];
			for (let j = 1; j <= this.columns; j++) {
				row.push(`${rowLetters[i]}${j}`);
			}
			seatMap.push(row);
		}
		this.seatMap = seatMap;
		this.capacity = this.rows * this.columns;
	}
	next();
});

// ✅ THÊM VALIDATE ĐỂ TÍNH CAPACITY
RoomSchema.pre("validate", function (next) {
	if (this.rows && this.columns) {
		this.capacity = this.rows * this.columns;
	}
	next();
});

module.exports = mongoose.model("Room", RoomSchema);
