const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Models
const User = require('./models/User');
const Chat = require('./models/Chat');
const Match = require('./models/Match');
const Report = require('./models/Report');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isUsingMongoDB = false;

const connectDB = async () => {
    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB');
            isUsingMongoDB = true;
        } catch (err) {
            console.error('❌ MongoDB Connection Error:', err);
            console.log('⚠️ Falling back to Local File Storage');
        }
    } else {
        console.log('ℹ️ No MONGODB_URI found. Using Local File Storage');
    }
};

// Initialize connection
connectDB();

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeData = (collection, data) => {
    fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
};

const db = {
    users: {
        find: async (query = {}) => {
            if (isUsingMongoDB) {
                return await User.find(query);
            }

            let data = readData('users');
            return data.filter(item => {
                return Object.keys(query).every(key => {
                    const filter = query[key];

                    if (filter && typeof filter === 'object') {
                        if (filter.$nin) {
                            return !filter.$nin.includes(item[key]);
                        }
                        // Add more filter operators as needed
                    }
                    return item[key] === filter;
                });
            });
        },
        findById: async (id) => {
            if (isUsingMongoDB) return await User.findById(id);
            return readData('users').find(u => u._id === id);
        },
        findOne: async (query) => {
            if (isUsingMongoDB) return await User.findOne(query);
            return readData('users').find(u => {
                return Object.keys(query).every(key => u[key] === query[key]);
            });
        },
        create: async (userData) => {
            if (isUsingMongoDB) return await User.create(userData);
            const users = readData('users');
            const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : '';
            const newUser = {
                _id: uuidv4(),
                ...userData,
                age: Number(userData.age),
                password: hashedPassword,
                likes: [],
                dislikes: [],
                matches: [],
                images: userData.images || [],
                interests: userData.interests || [],
                isPremium: false,
                onlineStatus: false,
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            writeData('users', users);
            return newUser;
        },
        findByIdAndUpdate: async (id, updates) => {
            if (isUsingMongoDB) return await User.findByIdAndUpdate(id, updates, { new: true });
            const users = readData('users');
            const index = users.findIndex(u => u._id === id);
            if (index !== -1) {
                if (updates.$push) {
                    for (let key in updates.$push) {
                        users[index][key] = [...(users[index][key] || []), updates.$push[key]];
                    }
                    delete updates.$push;
                }
                users[index] = { ...users[index], ...updates };
                writeData('users', users);
                return users[index];
            }
            return null;
        },
        comparePassword: async (candidatePassword, hashedPassword) => {
            return await bcrypt.compare(candidatePassword, hashedPassword);
        }
    },
    matches: {
        create: async (matchData) => {
            if (isUsingMongoDB) return await Match.create(matchData);
            const matches = readData('matches');
            const newMatch = { _id: uuidv4(), ...matchData, createdAt: new Date().toISOString() };
            matches.push(newMatch);
            writeData('matches', matches);
            return newMatch;
        }
    },
    reports: {
        create: async (reportData) => {
            if (isUsingMongoDB) return await Report.create(reportData);
            const reports = readData('reports');
            const newReport = { _id: uuidv4(), ...reportData, createdAt: new Date().toISOString() };
            reports.push(newReport);
            writeData('reports', reports);
            return newReport;
        }
    },
    chats: {
        find: async (query = {}) => {
            if (isUsingMongoDB) return await Chat.find(query);
            const chats = readData('chats');
            const membersId = query['members._id'];
            if (membersId) {
                return chats.filter(c => c.members.some(m => m === membersId || m._id === membersId));
            }
            return chats;
        },
        findById: async (id) => {
            if (isUsingMongoDB) return await Chat.findById(id);
            return readData('chats').find(c => c._id === id);
        },
        findOne: async (query) => {
            if (isUsingMongoDB) return await Chat.findOne(query);
            const chats = readData('chats');
            if (query.members && query.members.$all) {
                return chats.find(c => query.members.$all.every(id => c.members.some(m => (m === id || m._id === id))));
            }
            return null;
        },
        create: async (chatData) => {
            if (isUsingMongoDB) return await Chat.create(chatData);
            const chats = readData('chats');
            const newChat = { _id: uuidv4(), messages: [], ...chatData, createdAt: new Date().toISOString() };
            chats.push(newChat);
            writeData('chats', chats);
            return newChat;
        },
        findByIdAndUpdate: async (id, updates) => {
            if (isUsingMongoDB) return await Chat.findByIdAndUpdate(id, updates, { new: true });
            const chats = readData('chats');
            const index = chats.findIndex(c => c._id === id);
            if (index !== -1) {
                if (updates.$push) {
                    for (let key in updates.$push) {
                        chats[index][key] = [...(chats[index][key] || []), updates.$push[key]];
                    }
                    delete updates.$push;
                }
                if (updates.$set) {
                    chats[index] = { ...chats[index], ...updates.$set };
                    delete updates.$set;
                }
                chats[index] = { ...chats[index], ...updates };
                writeData('chats', chats);
                return chats[index];
            }
            return null;
        }
    }
};

module.exports = db;
