const mongoose = require('mongoose');
const uri = "mongodb+srv://uviii24568_db_user:%40sujal1234@cluster0.kz5lwzw.mongodb.net/?appName=Cluster0";

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
