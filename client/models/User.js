import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    genderPreference: { type: String, enum: ['male', 'female', 'both', 'other'], default: 'both' },
    bio: { type: String, default: '' },
    interests: [{ type: String }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    images: [{ type: String }], // Cloudinary or Local Upload URLs
    likes: [{ type: String }], // Using String for compatibility with UUIDs/ObjectIds
    dislikes: [{ type: String }],
    matches: [{ type: String }],
    isPremium: { type: Boolean, default: false },
    swipeLimit: { type: Number, default: 20 },
    lastSwipeDate: { type: Date, default: Date.now },
    onlineStatus: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (!this.password.startsWith('$2')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
