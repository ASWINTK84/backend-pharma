import express from 'express';
import { protect } from '../middleware/auth.js';
import { createShare, viewShared, shareLogs } from '../controllers/shareController.js';
const router = express.Router();

router.post('/create', protect, createShare);
router.get('/view/:token', viewShared); // open to public
router.get('/my-shares', protect, shareLogs);

export default router;
