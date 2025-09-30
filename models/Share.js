import mongoose from 'mongoose';
const ShareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String, unique: true },
  expiresAt: Date,
  views: [{
    ip: String,
    userAgent: String,
    viewedAt: { type: Date, default: Date.now },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // if viewer logged in
  }]
}, { timestamps: true });

export default mongoose.model('Share', ShareSchema);
