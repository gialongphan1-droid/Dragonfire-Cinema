const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true
		},

		productName: {
			type: String,
			required: true,
			trim: true
		},

		price: {
			type: Number,
			required: true
		},

		quantity: {
			type: Number,
			default: 0
		},

		size: {
			type: String,
			default: ""
		},

		image: {
			type: String,
			default: ""
		},

		description: {
			type: String,
			default: ""
		},

		status: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	});

module.exports = mongoose.model("Product", productSchema);