const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.userId = decoded.id;
        next();
    });
}

// Get Inventory Items (Protected Route)
router.get('/', verifyToken, async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inventory" });
    }
});

// Add New Inventory Item (Protected Route)
router.post('/add', verifyToken, async (req, res) => {
    const { item, quantity, category, price, supplier, brand, size, color } = req.body;
    try {
        const newItem = new Inventory({ item, quantity, category, price, supplier, brand, size, color });
        await newItem.save();
        res.json({ message: "Item added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding item" });
    }
});

// Delete Inventory Item (Protected Route)
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        await Inventory.findByIdAndDelete(itemId);
        res.json({ message: "Item deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item" });
    }
});

// Update Inventory Item (Protected Route)
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const itemId = req.params.id.trim();
        console.log("🔹 Backend Received ID:", itemId);
        console.log("🔹 Backend Received Data:", req.body);

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            console.log("❌ Invalid ID Format");
            return res.status(400).json({ message: "Invalid item ID format" });
        }

        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(itemId) },
            { $set: req.body },
            { new: true }
        );

        if (!updatedItem) {
            console.log("❌ Item Not Found");
            return res.status(404).json({ message: "Item not found" });
        }

        console.log("✅ Item Updated Successfully:", updatedItem);
        res.json({ message: "✅ Item updated successfully", updatedItem });
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ message: "Error updating item" });
    }
});

module.exports = router;
