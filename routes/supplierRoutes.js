const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier');

// ✅ Get All Suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error });
    }
});

// ✅ Add New Supplier
router.post('/add', async (req, res) => {
    try {
        const { name, contact, email, address } = req.body;
        const newSupplier = new Supplier({ name, contact, email, address });
        await newSupplier.save();
        res.json({ message: "Supplier added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding supplier", error });
    }
});

// ✅ Delete Supplier
router.delete('/delete/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting supplier", error });
    }
});

module.exports = router;
