const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);

// Global log buffer for debugging
global.serverLogs = [];
const log = (msg) => {
    console.log(msg);
    global.serverLogs.push(`[${new Date().toISOString()}] ${msg}`);
    if (global.serverLogs.length > 200) global.serverLogs.shift();
};

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000", "http://127.0.0.1:3000"];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
app.use('/uploads/chat', express.static(path.join(__dirname, 'data/uploads/chat')));

// Database Connection (Local Storage Initialization)
console.log('Local File Storage initialized');

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        storage: db.isUsingMongoDB ? 'MONGODB' : 'LOCAL_FILE_SYSTEM'
    });
});

// Socket connection
require('./sockets/socketMain')(io);

// Debug Logs
app.get('/api/debug/logs', (req, res) => {
    res.send(`<pre>${global.serverLogs.join('\n')}</pre>`);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error:', err);
    log(`Error: ${err.message}`);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
