const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// ✅ Get All Categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
});

// ✅ Add New Category
router.post('/add', async (req, res) => {
    try {
        const { name } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const newCategory = new Category({ name });
        await newCategory.save();
        res.json({ message: "Category added successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Error adding category", error });
    }
});

// ✅ Delete Category
router.delete('/delete/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
});

module.exports = router;
