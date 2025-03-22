const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Inventory = require('../models/inventory');
const jwt = require('jsonwebtoken');

// ✅ Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(403).json({ message: "Invalid Token Format" });
    }

    jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });

        req.userId = decoded.id;
        next();
    });
}


// ✅ Get All Orders (Protected Route)
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find().populate('items.itemId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// ✅ Create New Order (Protected Route)
// ✅ Create New Order
router.post('/add', verifyToken, async (req, res) => {
    const { customerName, items } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    try {
        let totalAmount = 0;
        for (const item of items) {
            let inventoryItem = await Inventory.findById(item.itemId);
            if (!inventoryItem) {
                return res.status(400).json({ message: `Item ${item.itemName} not found in inventory` });
            }

            if (inventoryItem.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${inventoryItem.item} (Available: ${inventoryItem.quantity}, Requested: ${item.quantity})` });
            }

            totalAmount += item.quantity * inventoryItem.price;

            // ✅ Reduce inventory stock
            inventoryItem.quantity -= item.quantity;
            await inventoryItem.save();
        }

        const newOrder = new Order({ customerName, items, totalAmount });
        await newOrder.save();
        res.json({ message: "Order placed successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
});

// ✅ Update Order Status API
router.put('/update-status/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "❌ Order not found" });
        }

        res.json({ message: "✅ Order status updated successfully!", updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "❌ Error updating order status", error });
    }
});


// ✅ Delete Order (Protected Route)
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order" });
    }
});

module.exports = router;
