import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';

const router = Router();

// All AI routes require authentication
router.use(authenticateToken);
router.use(requireAnyUser);

// TODO: Add AI controller methods
router.post('/suggest', (req, res) => {
  res.json({ message: 'AI appointment suggestion - TODO' });
});

router.post('/chat', (req, res) => {
  res.json({ message: 'AI chatbot - TODO' });
});

router.get('/analytics', (req, res) => {
  res.json({ message: 'AI analytics - TODO' });
});

export default router; 