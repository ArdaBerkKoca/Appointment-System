import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';
import { AIController } from '../controllers/aiController';

const router = Router();

// AI Chatbot - Genel soruları cevaplar (genel erişime açık)
router.post('/chat', AIController.chat);

// Diğer AI rotaları için kimlik doğrulama gerekli
router.use(authenticateToken);
router.use(requireAnyUser);

// AI Randevu Önerisi - En uygun zamanları önerir
router.post('/suggest', AIController.suggestAppointment);

// AI Görüşme Özeti - Randevu sonrası otomatik özet
router.post('/summary', AIController.generateSummary);

// AI Analitik - Sistem performans analizi
router.get('/analytics', AIController.getAnalytics);

export default router; 