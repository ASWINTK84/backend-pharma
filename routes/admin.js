import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { dashboard, listUsers, getUser, editUser, blockUser, unblockUser, adminLogin, deleteUser } from '../controllers/adminController.js';
import { uploadSingle } from '../middleware/upload.js';
const router = express.Router();


router.post("/login", adminLogin);


router.use(protect, admin);

router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', uploadSingle.fields([{ name: 'profilePhoto' }, { name: 'resume' }]), editUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

export default router;
