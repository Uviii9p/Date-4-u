const mongoose = require('mongoose');
const uri = "mongodb+srv://pubgb0232_db_user:%3Csujal1234%3E@cluster0.egwoi83.mongodb.net/?appName=Cluster0";

console.log("Connecting to:", uri);
mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connection Successful!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    });
