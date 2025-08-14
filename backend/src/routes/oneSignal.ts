import { Router } from 'express';
import { oneSignalService } from '../services/oneSignalService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Bildirim gönderme şemaları
const sendNotificationSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  message: Joi.string().required().min(1).max(500),
  url: Joi.string().uri().optional(),
  data: Joi.object().optional(),
  segments: Joi.array().items(Joi.string()).optional(),
  playerIds: Joi.array().items(Joi.string()).optional()
});

const sendToUsersSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  message: Joi.string().required().min(1).max(500),
  url: Joi.string().uri().optional(),
  data: Joi.object().optional(),
  playerIds: Joi.array().items(Joi.string()).min(1).required()
});

const sendToSegmentSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  message: Joi.string().required().min(1).max(500),
  url: Joi.string().uri().optional(),
  data: Joi.object().optional(),
  segment: Joi.string().required()
});

// Randevu bildirimleri için şemalar
const appointmentReminderSchema = Joi.object({
  playerIds: Joi.array().items(Joi.string()).min(1).required(),
  appointmentData: Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    consultantName: Joi.string().required()
  }).required()
});

const appointmentUpdateSchema = Joi.object({
  playerIds: Joi.array().items(Joi.string()).min(1).required(),
  appointmentData: Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    oldDate: Joi.string().optional(),
    newDate: Joi.string().required(),
    oldTime: Joi.string().optional(),
    newTime: Joi.string().required(),
    consultantName: Joi.string().required()
  }).required()
});

const appointmentCancellationSchema = Joi.object({
  playerIds: Joi.array().items(Joi.string()).min(1).required(),
  appointmentData: Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    consultantName: Joi.string().required(),
    reason: Joi.string().optional()
  }).required()
});

const appointmentConfirmationSchema = Joi.object({
  playerIds: Joi.array().items(Joi.string()).min(1).required(),
  appointmentData: Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    consultantName: Joi.string().required()
  }).required()
});

// AI önerisi şeması
const aiRecommendationSchema = Joi.object({
  playerIds: Joi.array().items(Joi.string()).min(1).required(),
  recommendationData: Joi.object({
    type: Joi.string().valid('time_slot', 'service', 'consultant').required(),
    message: Joi.string().required(),
    actionUrl: Joi.string().uri().required()
  }).required()
});

// Kullanıcı etiketleri şeması
const updateUserTagsSchema = Joi.object({
  playerId: Joi.string().required(),
  tags: Joi.object().required()
});

const segmentOperationSchema = Joi.object({
  playerId: Joi.string().required(),
  segment: Joi.string().required()
});

// Tüm kullanıcılara bildirim gönder
router.post('/send-to-all',
  authenticateToken,
  validateRequest(sendNotificationSchema),
  async (req, res) => {
    try {
      const result = await oneSignalService.sendNotificationToAll(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Belirli kullanıcılara bildirim gönder
router.post('/send-to-users',
  authenticateToken,
  validateRequest(sendToUsersSchema),
  async (req, res) => {
    try {
      const { playerIds, ...notificationData } = req.body;
      const result = await oneSignalService.sendNotificationToUsers(notificationData, playerIds);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Segment'e bildirim gönder
router.post('/send-to-segment',
  authenticateToken,
  validateRequest(sendToSegmentSchema),
  async (req, res) => {
    try {
      const { segment, ...notificationData } = req.body;
      const result = await oneSignalService.sendNotificationToSegment(notificationData, segment);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Randevu hatırlatması gönder
router.post('/appointment-reminder',
  authenticateToken,
  validateRequest(appointmentReminderSchema),
  async (req, res) => {
    try {
      const { playerIds, appointmentData } = req.body;
      const result = await oneSignalService.sendAppointmentReminder(playerIds, appointmentData);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Randevu güncelleme bildirimi gönder
router.post('/appointment-update',
  authenticateToken,
  validateRequest(appointmentUpdateSchema),
  async (req, res) => {
    try {
      const { playerIds, appointmentData } = req.body;
      const result = await oneSignalService.sendAppointmentUpdate(playerIds, appointmentData);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Randevu iptal bildirimi gönder
router.post('/appointment-cancellation',
  authenticateToken,
  validateRequest(appointmentCancellationSchema),
  async (req, res) => {
    try {
      const { playerIds, appointmentData } = req.body;
      const result = await oneSignalService.sendAppointmentCancellation(playerIds, appointmentData);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Randevu onay bildirimi gönder
router.post('/appointment-confirmation',
  authenticateToken,
  validateRequest(appointmentConfirmationSchema),
  async (req, res) => {
    try {
      const { playerIds, appointmentData } = req.body;
      const result = await oneSignalService.sendAppointmentConfirmation(playerIds, appointmentData);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// AI önerisi bildirimi gönder
router.post('/ai-recommendation',
  authenticateToken,
  validateRequest(aiRecommendationSchema),
  async (req, res) => {
    try {
      const { playerIds, recommendationData } = req.body;
      const result = await oneSignalService.sendAIRecommendation(playerIds, recommendationData);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Kullanıcı etiketlerini güncelle
router.put('/user-tags',
  authenticateToken,
  validateRequest(updateUserTagsSchema),
  async (req, res) => {
    try {
      const { playerId, tags } = req.body;
      const result = await oneSignalService.updateUserTags(playerId, tags);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Kullanıcıyı segmente ekle
router.post('/add-to-segment',
  authenticateToken,
  validateRequest(segmentOperationSchema),
  async (req, res) => {
    try {
      const { playerId, segment } = req.body;
      const result = await oneSignalService.addUserToSegment(playerId, segment);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Kullanıcıyı segmentten çıkar
router.delete('/remove-from-segment',
  authenticateToken,
  validateRequest(segmentOperationSchema),
  async (req, res) => {
    try {
      const { playerId, segment } = req.body;
      const result = await oneSignalService.removeUserFromSegment(playerId, segment);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Bildirim geçmişini getir
router.get('/history',
  authenticateToken,
  async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const result = await oneSignalService.getNotificationHistory(Number(limit), Number(offset));
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// Bildirim istatistiklerini getir (son 50 bildirim)
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await oneSignalService.getNotificationHistory(50, 0);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

export default router;
