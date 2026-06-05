const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const comboController = require("../controllers/comboDetailController");

/* =========================
   CATEGORY ROUTES
========================= */

// CREATE CATEGORY
router.post("/categories", categoryController.createCategory);

// READ ALL CATEGORIES
router.get("/categories", categoryController.getAllCategories);

// READ CATEGORY BY ID
router.get("/categories/:id", categoryController.getCategoryById);

// UPDATE CATEGORY
router.put("/categories/:id", categoryController.updateCategory);

// DELETE CATEGORY
router.delete("/categories/:id", categoryController.deleteCategory);


/* =========================
   PRODUCT ROUTES
========================= */

/* =========================
   COMBO ROUTES
   Put these before "/:id" so "/combos" is not treated as a product id.
========================= */

// ADD PRODUCT TO COMBO
router.post("/combos", comboController.createComboDetail);

// GET ALL COMBO DETAILS
router.get("/combos", comboController.getAllComboDetails);

// GET COMBO DETAIL BY ID
router.get("/combos/:id", comboController.getComboDetailById);

// UPDATE COMBO DETAIL
router.put("/combos/:id", comboController.updateComboDetail);

// DELETE COMBO DETAIL
router.delete("/combos/:id", comboController.deleteComboDetail);

// CREATE PRODUCT
router.post("/", productController.createProduct);

// READ ALL PRODUCTS
router.get("/", productController.getAllProducts);

// READ PRODUCT BY ID
router.get("/:id", productController.getProductById);

// UPDATE PRODUCT
router.put("/:id", productController.updateProduct);

// DELETE PRODUCT
router.delete("/:id", productController.deleteProduct);

module.exports = router;
