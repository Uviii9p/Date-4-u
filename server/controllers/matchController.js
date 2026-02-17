const db = require('../db');

const swipeUser = async (req, res) => {
    const { targetUserId, direction } = req.body;
    try {
        const currentUser = db.users.findById(req.user.id);
        const targetUser = db.users.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (direction === 'like') {
            db.users.findByIdAndUpdate(req.user.id, {
                $push: { likes: targetUserId }
            });

            if (targetUser.likes?.includes(req.user.id)) {
                // MATCH!
                db.users.findByIdAndUpdate(req.user.id, { $push: { matches: targetUserId } });
                db.users.findByIdAndUpdate(targetUserId, { $push: { matches: req.user.id } });

                db.matches.create({ users: [req.user.id, targetUserId] });
                db.chats.create({ members: [req.user.id, targetUserId], messages: [] });

                return res.json({ match: true, targetUser });
            }
        } else {
            db.users.findByIdAndUpdate(req.user.id, {
                $push: { dislikes: targetUserId }
            });
        }

        res.json({ match: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMatches = async (req, res) => {
    try {
        const user = db.users.findById(req.user.id);
        const matches = (user.matches || []).map(id => {
            const matchUser = db.users.findById(id);
            if (matchUser) {
                const { password, ...safeUser } = matchUser;
                return safeUser;
            }
            return null;
        }).filter(u => u !== null);

        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { swipeUser, getMatches };
