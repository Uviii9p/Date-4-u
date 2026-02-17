const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');

router.post('/', protect, async (req, res) => {
    const { reportedUserId, reason } = req.body;
    try {
        const report = await db.reports.create({
            reporter: req.user.id,
            reportedUser: reportedUserId,
            reason
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
