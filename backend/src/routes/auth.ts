import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  changePassword,
  logout,
} from '../controllers/authController';
import { authenticateToken, requireAnyUser } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, requireAnyUser, getProfile);
router.put('/change-password', authenticateToken, requireAnyUser, changePassword);
router.post('/logout', authenticateToken, requireAnyUser, logout);

export default router; 