const db = require('../db');

const getProfile = async (req, res) => {
    try {
        const user = db.users.findById(req.user.id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log(`[API] Updating profile for user: ${req.user.id}`);
        console.log(`[API] Request Body:`, req.body);

        const user = db.users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = {
            name: req.body.name || user.name,
            bio: req.body.bio || user.bio,
            age: req.body.age ? Number(req.body.age) : user.age,
            gender: req.body.gender || user.gender,
            genderPreference: req.body.genderPreference || user.genderPreference,
        };

        if (req.body.interests) {
            try {
                updates.interests = JSON.parse(req.body.interests);
            } catch (e) {
                console.error('[API] Error parsing interests:', e);
                updates.interests = req.body.interests.split(',').map(i => i.trim()).filter(i => i);
            }
        }

        if (req.files && req.files.length > 0) {
            console.log(`[API] Received ${req.files.length} files`);
            // Construct relative URLs for local storage
            const imageUrls = req.files.map(file => {
                if (file.filename) {
                    return `/uploads/${file.filename}`;
                }
                return file.path || file.url; // Fallback for Cloudinary if configured
            });
            updates.images = [...(user.images || []), ...imageUrls].slice(-6);
        }

        const updatedUser = db.users.findByIdAndUpdate(req.user.id, updates);
        console.log(`[API] Profile updated successfully for: ${req.user.id}`);
        const { password, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (error) {
        console.error(`[API] Update profile error:`, error);
        res.status(500).json({ message: error.message });
    }
};

const getDiscoveryUsers = async (req, res) => {
    try {
        const currentUser = db.users.findById(req.user.id);
        const excludeIds = [...(currentUser.likes || []), ...(currentUser.dislikes || []), ...(currentUser.matches || []), currentUser._id];

        let query = {
            _id: { $nin: excludeIds },
            age: { $gte: 18 }
        };

        if (currentUser.genderPreference !== 'both') {
            query.gender = currentUser.genderPreference;
        }

        const users = db.users.find(query);

        // Sort by common interests matching score
        const sortedUsers = users.map(user => {
            const commonInterests = (user.interests || []).filter(interest =>
                (currentUser.interests || []).includes(interest)
            );
            return { ...user, matchScore: commonInterests.length };
        }).sort((a, b) => b.matchScore - a.matchScore);

        res.json(sortedUsers.slice(0, 20));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const currentUser = db.users.findById(req.user.id);
        const allUsers = db.users.find({
            _id: { $ne: currentUser._id } // Exclude self
        });

        // Simple name or ID search
        const searchResults = allUsers.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user._id === query
        );

        res.json(searchResults.slice(0, 20)); // Limit results
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = db.users.findById(req.params.id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, getDiscoveryUsers, searchUsers, getUserById };
