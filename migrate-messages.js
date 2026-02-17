const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const chatsPath = path.join(__dirname, 'server', 'data', 'chats.json');

if (!fs.existsSync(chatsPath)) {
    console.error('chats.json not found at', chatsPath);
    process.exit(1);
}

const chats = JSON.parse(fs.readFileSync(chatsPath, 'utf8'));
let updatedCount = 0;

chats.forEach(chat => {
    chat.messages.forEach(msg => {
        if (!msg._id) {
            msg._id = crypto.randomUUID();
            updatedCount++;
        }
    });
});

fs.writeFileSync(chatsPath, JSON.stringify(chats, null, 2));
console.log(`Successfully updated ${updatedCount} messages with unique IDs.`);
