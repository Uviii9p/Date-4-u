const db = require('../db');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, age, gender } = req.body;
    console.log(`[API] Attempting registration for: ${email}`);

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userExists = db.users.findOne({ email });
        if (userExists) {
            console.log(`[API] Registration failed: User ${email} already exists`);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await db.users.create({ name, email, password, age, gender });
        if (user) {
            console.log(`[API] Registration successful for: ${email}`);
            const { password: hashedPw, ...userWithoutPassword } = user;
            res.status(201).json({
                ...userWithoutPassword,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(`[API] Registration error for ${email}:`, error);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[API] Attempting login for: ${email}`);

    try {
        const user = db.users.findOne({ email });
        if (user && (await db.users.comparePassword(password, user.password))) {
            console.log(`[API] Login successful for: ${email}`);
            const { password: pass, ...userWithoutPassword } = user;
            res.json({
                ...userWithoutPassword,
                token: generateToken(user._id)
            });
        } else {
            console.log(`[API] Login failed for: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`[API] Login error for ${email}:`, error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
