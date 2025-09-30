import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateMembershipId } from '../utils/membership.js';
import { sendVerificationEmail } from '../utils/email.js';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

function signJwt(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    
    let profilePhoto = null;
    let resume = null;
    if (req.files && req.files.profilePhoto) {
      const file = req.files.profilePhoto[0];
      const upload = await cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'socrp/profile' }, (error, result) => {});
      
      const b64 = file.buffer.toString('base64');
      const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
      const result = await cloudinary.uploader.upload(dataUri, { folder: 'socrp/profile' });
      profilePhoto = { url: result.secure_url, public_id: result.public_id };
    }
    if (req.files && req.files.resume) {
      const file = req.files.resume[0];
      const b64 = file.buffer.toString('base64');
      const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
      
      const result = await cloudinary.uploader.upload(dataUri, { folder: 'socrp/resume', resource_type: 'raw' });
      resume = { url: result.secure_url, public_id: result.public_id.split('/').pop(), filename: file.originalname };
    }

    const hash = await bcrypt.hash(password, 10);
    const membershipId = await generateMembershipId();

    const user = new User({
      membershipId,
      fullName,
      email,
      phone,
      password: hash,
      profilePhoto,
      resume,
      status: 'pending'
    });
    await user.save();

   
    const token = signJwt({ id: user._id }, '1d'); 
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: 'Registered, check your email to verify' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'active';
    await user.save();
    return res.json({ message: 'Email verified, account active' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.status !== 'active' && !user.isAdmin) return res.status(403).json({ message: 'Please verify your account' });
    const token = signJwt({ id: user._id });
    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, membershipId: user.membershipId, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
