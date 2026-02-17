const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
        find: (query = {}) => {
            let data = readData('users');
            return data.filter(item => {
                return Object.keys(query).every(key => {
                    const filter = query[key];
                    if (filter && typeof filter === 'object') {
                        if (filter.$nin) return !filter.$nin.includes(item[key]);
                        if (filter.$in) return filter.$in.includes(item[key]);
                        if (filter.$gte) return item[key] >= filter.$gte;
                        if (filter.$ne) return item[key] !== filter.$ne;
                    }
                    return item[key] === filter;
                });
            });
        },
        findById: (id) => readData('users').find(u => u._id === id),
        findOne: (query) => readData('users').find(u => {
            return Object.keys(query).every(key => u[key] === query[key]);
        }),
        create: async (userData) => {
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
        findByIdAndUpdate: (id, updates) => {
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
        create: (matchData) => {
            const matches = readData('matches');
            const newMatch = { _id: uuidv4(), ...matchData, createdAt: new Date().toISOString() };
            matches.push(newMatch);
            writeData('matches', matches);
            return newMatch;
        }
    },
    reports: {
        create: (reportData) => {
            const reports = readData('reports');
            const newReport = { _id: uuidv4(), ...reportData, createdAt: new Date().toISOString() };
            reports.push(newReport);
            writeData('reports', reports);
            return newReport;
        }
    },
    chats: {
        find: (query = {}) => {
            const chats = readData('chats');
            const membersId = query['members._id'];
            if (membersId) {
                return chats.filter(c => c.members.some(m => m === membersId || m._id === membersId));
            }
            return chats;
        },
        findById: (id) => readData('chats').find(c => c._id === id),
        findOne: (query) => {
            const chats = readData('chats');
            if (query.members && query.members.$all) {
                return chats.find(c => query.members.$all.every(id => c.members.some(m => (m === id || m._id === id))));
            }
            return null;
        },
        create: (chatData) => {
            const chats = readData('chats');
            const newChat = { _id: uuidv4(), messages: [], ...chatData, createdAt: new Date().toISOString() };
            chats.push(newChat);
            writeData('chats', chats);
            return newChat;
        },
        findByIdAndUpdate: (id, updates) => {
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
