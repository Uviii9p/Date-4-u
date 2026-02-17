import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    users: [{ type: String }], // Using String for compatibility
    createdAt: { type: Date, default: Date.now },
    isSuperLike: { type: Boolean, default: false }
});

export default mongoose.models.Match || mongoose.model('Match', matchSchema);
