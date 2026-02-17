const db = require('../db');

const swipeUser = async (req, res) => {
    const { targetUserId, direction } = req.body;
    try {
        const currentUser = await db.users.findById(req.user.id);
        const targetUser = await db.users.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (direction === 'like') {
            await db.users.findByIdAndUpdate(req.user.id, {
                $push: { likes: targetUserId }
            });

            if (targetUser.likes?.includes(req.user.id)) {
                // MATCH!
                await db.users.findByIdAndUpdate(req.user.id, { $push: { matches: targetUserId } });
                await db.users.findByIdAndUpdate(targetUserId, { $push: { matches: req.user.id } });

                await db.matches.create({ users: [req.user.id, targetUserId] });
                await db.chats.create({ members: [req.user.id, targetUserId], messages: [] });

                return res.json({ match: true, targetUser });
            }
        } else {
            await db.users.findByIdAndUpdate(req.user.id, {
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
        const user = await db.users.findById(req.user.id);
        const matchIds = user.matches || [];

        const matches = await Promise.all(matchIds.map(async (id) => {
            const matchUser = await db.users.findById(id);
            if (matchUser) {
                const { password, ...safeUser } = isUsingMongoDB ? matchUser._doc : matchUser;
                return safeUser;
            }
            return null;
        }));

        res.json(matches.filter(u => u !== null));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { swipeUser, getMatches };
