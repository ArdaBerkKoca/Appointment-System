import express from 'express';
import { sendEmail } from '../config/email';
import { oneSignalService } from '../services/oneSignalService';

const router = express.Router();

// Test e-posta gönderme endpoint'i
router.post('/send-test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        error: 'E-posta adresi gerekli' 
      });
    }

    console.log('🧪 Test email sending to:', to);
    
    const result = await sendEmail(
      to,
      'Test E-postası - Randevu Sistemi',
      `
        <h2>Test E-postası</h2>
        <p>Bu bir test e-postasıdır.</p>
        <p>Randevu sistemi e-posta konfigürasyonu çalışıyor!</p>
        <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
      `
    );

    if (result) {
      return res.json({ 
        success: true, 
        message: 'Test e-postası başarıyla gönderildi',
        to: to
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'E-posta gönderilemedi' 
      });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'E-posta gönderme hatası',
      details: error.message 
    });
  }
});

// OneSignal e-posta test endpoint'i
router.post('/send-onesignal-email', async (req, res) => {
  try {
    const { to, templateType } = req.body;
    
    if (!to || !templateType) {
      return res.status(400).json({ 
        success: false, 
        error: 'E-posta adresi ve template türü gerekli' 
      });
    }

    console.log('🧪 OneSignal test email sending to:', to, 'template:', templateType);
    
    let result;
    
    switch (templateType) {
      case 'reminder':
        result = await oneSignalService.sendAppointmentReminderEmail(to, {
          id: 'test-123',
          title: 'Test Randevusu',
          date: '2024-01-15',
          time: '14:00',
          consultantName: 'Test Danışman',
          userName: 'Test Kullanıcı',
          location: 'Test Lokasyon'
        });
        break;
        
      case 'confirmation':
        result = await oneSignalService.sendAppointmentConfirmationEmail(to, {
          id: 'test-123',
          title: 'Test Randevusu',
          date: '2024-01-15',
          time: '14:00',
          consultantName: 'Test Danışman',
          userName: 'Test Kullanıcı',
          location: 'Test Lokasyon'
        });
        break;
        
      case 'update':
        result = await oneSignalService.sendAppointmentUpdateEmail(to, {
          id: 'test-123',
          title: 'Test Randevusu',
          oldDate: '2024-01-15',
          newDate: '2024-01-16',
          oldTime: '14:00',
          newTime: '15:00',
          consultantName: 'Test Danışman',
          userName: 'Test Kullanıcı',
          location: 'Test Lokasyon'
        });
        break;
        
      case 'cancellation':
        result = await oneSignalService.sendAppointmentCancellationEmail(to, {
          id: 'test-123',
          title: 'Test Randevusu',
          date: '2024-01-15',
          time: '14:00',
          consultantName: 'Test Danışman',
          userName: 'Test Kullanıcı',
          reason: 'Test sebebi',
          location: 'Test Lokasyon'
        });
        break;
        
      case 'ai-recommendation':
        result = await oneSignalService.sendAIRecommendationEmail(to, {
          type: 'time_slot',
          message: 'Size uygun yeni zaman dilimleri bulundu!',
          actionUrl: 'http://localhost:3000/appointments/create',
          userName: 'Test Kullanıcı'
        });
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Geçersiz template türü. Kullanılabilir: reminder, confirmation, update, cancellation, ai-recommendation' 
        });
    }

    if (result) {
      return res.json({ 
        success: true, 
        message: 'OneSignal test e-postası başarıyla gönderildi',
        to: to,
        templateType: templateType,
        result: result
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'OneSignal e-postası gönderilemedi' 
      });
    }
  } catch (error: any) {
    console.error('OneSignal test email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'OneSignal e-posta gönderme hatası',
      details: error.message 
    });
  }
});

export default router;
