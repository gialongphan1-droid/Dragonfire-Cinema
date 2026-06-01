const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Category", categorySchema);