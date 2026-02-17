import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: { type: String, required: true },
    reportedUser: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
