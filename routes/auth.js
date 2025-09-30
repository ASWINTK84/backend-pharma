import express from 'express';
import { register, verifyEmail, login } from '../controllers/authController.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', uploadSingle.fields([{ name: 'profilePhoto' }, { name: 'resume' }]), register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);

export default router;
