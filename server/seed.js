const db = require('./db');
const mongoose = require('mongoose');

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
        // Wait for DB connection to be established if using MongoDB
        if (process.env.MONGODB_URI) {
            console.log("Seeding to MongoDB...");
            // Small delay to ensure connection is ready
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Optional: Clear existing users
            const User = require('./models/User');
            await User.deleteMany({});
            console.log("Cleared existing MongoDB users.");
        } else {
            console.log("Seeding to local storage...");
            // ... (keep local storage logic if needed, but db.js handles abstraction)
        }

        for (const user of dummyUsers) {
            await db.users.create(user);
        }

        console.log("Added dummy users successfully!");
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedDB();
