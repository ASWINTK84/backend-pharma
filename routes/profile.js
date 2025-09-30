import express from 'express';
import { getProfile, getResume, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, uploadSingle.fields([{ name:'profilePhoto' }, { name:'resume' }]), updateProfile);
router.get('/resume/:public_id',  getResume);

export default router;
