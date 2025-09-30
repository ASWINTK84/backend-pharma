import Share from '../models/Share.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const createShare = async (req, res) => {
  const { days } = req.body; 
  const daysNum = parseInt(days) || 1;
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000);
  const share = new Share({ user: req.user._id, token, expiresAt });
  await share.save();
  res.json({ shareLink: `${process.env.FRONTEND_URL}/shared/${token}`, token, expiresAt });
};

export const viewShared = async (req, res) => {
  const { token } = req.params;
  const share = await Share.findOne({ token }).populate('user');
  if (!share) return res.status(404).json({ message: 'Link invalid' });
  if (new Date() > share.expiresAt) return res.status(410).json({ message: 'Link expired' });


  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  share.views.push({ ip, userAgent: req.headers['user-agent'], viewerId: req.user ? req.user._id : null });
  await share.save();

  
  const user = share.user;
  const publicProfile = {
    photo: user.profilePhoto?.url,
    fullName: user.fullName,
    membershipId: user.membershipId,
    education: user.education,
    experience: user.experience,
    skills: user.skills,
    languages: user.languages,
    resume: user.resume?.url,
    email: user.email
  };
  res.json(publicProfile);
};

export const shareLogs = async (req, res) => {
  const shares = await Share.find({ user: req.user._id });
  res.json(shares);
};
