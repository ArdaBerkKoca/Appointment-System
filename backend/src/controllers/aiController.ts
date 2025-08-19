import { Request, Response } from 'express';
import openai from '../config/openai';
import { AppointmentModel } from '../models/Appointment';
import { UserModel } from '../models/User';

export class AIController {
  // AI Chatbot - Genel soruları cevaplar
  static async chat(req: Request, res: Response) {
    try {
      const { message, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mesaj gerekli' 
        });
      }

      // Sistem prompt'u
      const systemPrompt = `Sen bir randevu sistemi asistanısın. Türkçe konuşuyorsun ve kullanıcılara yardımcı oluyorsun.
      
      Sık sorulan sorular:
      - Hangi hizmetler var? → Danışmanlık hizmetleri, randevu yönetimi, bildirimler
      - İptal politikası nedir? → 24 saat öncesine kadar ücretsiz iptal
      - Nasıl randevu alırım? → Danışman seç → Tarih seç → Onayla
      - Ödeme nasıl yapılır? → Güvenli online ödeme (kredi kartı, banka kartı)
      
      Kısa ve net cevaplar ver, emoji kullan.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Üzgünüm, şu anda cevap veremiyorum.';

      return res.json({
        success: true,
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI Chat error:', error);
      return res.status(500).json({
        success: false,
        message: 'AI servisi şu anda kullanılamıyor'
      });
    }
  }

  // AI Randevu Önerisi - En uygun zamanları önerir
  static async suggestAppointment(req: Request, res: Response) {
    try {
      const { consultantId, preferredDate, duration = 60 } = req.body;
      const userId = (req as any).user.id;

      if (!consultantId || !preferredDate) {
        return res.status(400).json({
          success: false,
          message: 'Danışman ID ve tercih edilen tarih gerekli'
        });
      }

      // Danışman bilgilerini al
      const consultant = await UserModel.findById(consultantId);
      if (!consultant || consultant.user_type !== 'consultant') {
        return res.status(404).json({
          success: false,
          message: 'Danışman bulunamadı'
        });
      }

      // Mevcut randevuları kontrol et
      const existingAppointments = await AppointmentModel.findByUser(consultantId, 'consultant');
      
      // AI ile uygun zaman önerisi
      const systemPrompt = `Sen bir randevu planlama uzmanısın. 
      
      Danışman: ${consultant.full_name}
      Tercih edilen tarih: ${preferredDate}
      Süre: ${duration} dakika
      
      Mevcut randevular: ${JSON.stringify(existingAppointments.map((apt: any) => ({
        start: apt.start_time,
        end: apt.end_time
      })))}
      
      En uygun 3 zaman önerisi ver. Format: "HH:MM - HH:MM"`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Uygun zamanları öner" }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const suggestion = completion.choices[0]?.message?.content || '';

      return res.json({
        success: true,
        data: {
          suggestion,
          consultant: {
            id: consultant.id,
            name: consultant.full_name
          },
          duration,
          preferredDate
        }
      });

    } catch (error) {
      console.error('AI Suggestion error:', error);
      return res.status(500).json({
        success: false,
        message: 'Öneri oluşturulamadı'
      });
    }
  }

  // AI Görüşme Özeti - Randevu sonrası otomatik özet
  static async generateSummary(req: Request, res: Response) {
    try {
      const { appointmentId, notes } = req.body;
      const userId = (req as any).user.id;

      if (!appointmentId || !notes) {
        return res.status(400).json({
          success: false,
          message: 'Randevu ID ve notlar gerekli'
        });
      }

      // Randevu bilgilerini al
      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu bulunamadı'
        });
      }

      // AI ile özet oluştur
      const systemPrompt = `Sen bir danışmanlık görüşmesi özet uzmanısın.
      
      Görüşme notları: ${notes}
      
      Bu notları analiz ederek şu formatta özet oluştur:
      1. Ana Problemler
      2. Çözüm Önerileri
      3. Sonraki Adımlar
      4. Önemli Notlar
      
      Kısa ve öz ol, madde halinde yaz.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Görüşme özeti oluştur" }
        ],
        max_tokens: 300,
        temperature: 0.4
      });

      const summary = completion.choices[0]?.message?.content || '';

      return res.json({
        success: true,
        data: {
          appointmentId,
          summary,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI Summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Özet oluşturulamadı'
      });
    }
  }

  // AI Analitik - Sistem performans analizi
  static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await UserModel.findById(userId);

      if (!user || user.user_type !== 'consultant') {
        return res.status(403).json({
          success: false,
          message: 'Sadece danışmanlar analitik görebilir'
        });
      }

      // Randevu istatistiklerini al
      const appointments = await AppointmentModel.findByUser(userId, 'consultant');
      
      const stats = {
        total: appointments.length,
        completed: appointments.filter((apt: any) => apt.status === 'completed').length,
        cancelled: appointments.filter((apt: any) => apt.status === 'cancelled').length,
        pending: appointments.filter((apt: any) => apt.status === 'pending').length
      };

      // AI ile analiz
      const systemPrompt = `Sen bir iş analisti uzmanısın.
      
      Danışman: ${user.full_name}
      Randevu istatistikleri: ${JSON.stringify(stats)}
      
      Bu verileri analiz ederek:
      1. Performans değerlendirmesi
      2. İyileştirme önerileri
      3. Trend analizi
      
      Kısa ve yapıcı öneriler ver.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Performans analizi yap" }
        ],
        max_tokens: 250,
        temperature: 0.3
      });

      const analysis = completion.choices[0]?.message?.content || '';

      return res.json({
        success: true,
        data: {
          stats,
          analysis,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI Analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Analitik oluşturulamadı'
      });
    }
  }
}
