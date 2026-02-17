const db = require('./db');
const fs = require('fs');
const path = require('path');

const dummyUsers = [
    {
        name: "Aria Smith",
        email: "aria@example.com",
        password: "password123",
        age: 24,
        gender: "female",
        genderPreference: "male",
        bio: "Coffee lover and world traveler. Looking for someone to share adventures with.",
        interests: ["Traveling", "Coffee", "Photography"],
        images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"],
        location: { type: "Point", coordinates: [-122.4194, 37.7749] }
    },
    {
        name: "James Wilson",
        email: "james@example.com",
        password: "password123",
        age: 28,
        gender: "male",
        genderPreference: "female",
        bio: "Tech enthusiast and foodie. Always down for a good brunch.",
        interests: ["Tech", "Cooking", "Brunch"],
        images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"],
        location: { type: "Point", coordinates: [-122.4194, 37.7749] }
    }
];

const seedDB = async () => {
    try {
        console.log("Preparing local storage for seeding...");

        // Clear existing local data
        const DATA_DIR = path.join(__dirname, 'data');
        if (fs.existsSync(DATA_DIR)) {
            const files = fs.readdirSync(DATA_DIR);
            for (const file of files) {
                fs.unlinkSync(path.join(DATA_DIR, file));
            }
        } else {
            fs.mkdirSync(DATA_DIR);
        }

        console.log("Cleared existing local data.");

        for (const user of dummyUsers) {
            await db.users.create(user);
        }

        console.log("Added dummy users to local storage successfully!");
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedDB();
