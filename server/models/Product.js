const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		categoryName: { type: String, required: true }, // Ví dụ: 'Bắp', 'Nước Ngọt', 'Combo'
		productType: { type: String, enum: ["single", "combo"], default: "single" },
		image: String,
		description: String,
		status: { type: String, enum: ["active", "inactive"], default: "active" },
		variants: [
			{
				size: String, // 'S', 'M', 'L'
				price: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
