import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';
import { getConsultants, getProfile, updateProfile, changePassword } from '../controllers/userController';

const router = Router();

// Tüm kullanıcı rotaları için kimlik doğrulama gerekli
router.use(authenticateToken, requireAnyUser);

// Danışmanları listele
router.get('/consultants', getConsultants);

// Profil görüntüle
router.get('/me', getProfile);

// Profil güncelle
router.put('/me', updateProfile);

// Şifre değiştir
router.put('/change-password', changePassword);

export default router; 