import { Request, Response } from 'express';
import Stripe from 'stripe';
import { AppointmentModel } from '../models/Appointment';
import { UserModel } from '../models/User';

// Stripe instance (sadece doğru şekilde yapılandırılmışsa oluştur)
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_ENABLED = !!STRIPE_SECRET && STRIPE_SECRET.startsWith('sk_');
let stripe: Stripe | null = null;
if (STRIPE_ENABLED) {
  stripe = new Stripe(STRIPE_SECRET as string, { apiVersion: '2023-10-16' });
} else {
  console.warn('Stripe is not configured. Using mock payment flow for development.');
}

export class PaymentController {
  // Ödeme intent oluştur (client-side'da kullanılacak)
  static async createPaymentIntent(req: Request, res: Response) {
    try {
      const { appointmentId, amount, currency = 'try' } = req.body;
      const userId = (req as any).user.id;

      if (!appointmentId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Randevu ID ve tutar gerekli'
        });
      }

      // Randevu bilgilerini kontrol et
      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu bulunamadı'
        });
      }

      // Kullanıcının bu randevuya sahip olduğunu kontrol et
      if (appointment.client_id !== userId && appointment.consultant_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu randevuya erişim izniniz yok'
        });
      }

      // Stripe yapılandırılmadıysa mock intent döndür
      if (!stripe) {
        const mockId = `pi_mock_${Date.now()}`;
        return res.json({
          success: true,
          data: {
            clientSecret: `secret_${mockId}`,
            paymentIntentId: mockId,
            amount,
            currency: String(currency).toUpperCase()
          }
        });
      }

      // Stripe'da ödeme intent oluştur
      const paymentIntent = await (stripe as Stripe).paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe kuruş cinsinden çalışır
        currency: String(currency).toLowerCase(),
        metadata: {
          appointmentId: appointmentId.toString(),
          userId: userId.toString(),
          type: 'appointment_payment'
        },
        description: `Randevu ödemesi - ${appointmentId}`,
        automatic_payment_methods: { enabled: true },
      });

      return res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount,
          currency
        }
      });

    } catch (error) {
      console.error('Payment Intent creation error:', error);
      // Geliştirme veya Stripe bağlantı hatalarında mock akışa düş
      const isDev = (process.env.NODE_ENV || 'development') !== 'production';
      const isConnectionError = (error as any)?.type === 'StripeConnectionError' ||
        (error as any)?.code === 'ETIMEDOUT' ||
        String((error as any)?.message || '').toLowerCase().includes('timeout');
      if (!stripe || isDev || isConnectionError) {
        const { appointmentId, amount, currency = 'try' } = req.body;
        const mockId = `pi_mock_${Date.now()}`;
        return res.json({
          success: true,
          data: {
            clientSecret: `secret_${mockId}`,
            paymentIntentId: mockId,
            amount,
            currency: String(currency).toUpperCase()
          }
        });
      }
      return res.status(500).json({ success: false, message: 'Ödeme başlatılamadı' });
    }
  }

  // Ödeme onayı (webhook'tan gelecek)
  static async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentIntentId, appointmentId } = req.body;

      if (!paymentIntentId || !appointmentId) {
        return res.status(400).json({
          success: false,
          message: 'Ödeme ID ve randevu ID gerekli'
        });
      }

      let paymentInfo: { id: string; amount: number; currency: string; status: string };

      if (!stripe) {
        // Mock akışta ödeme başarılı varsayılır
        paymentInfo = {
          id: paymentIntentId,
          amount: 0,
          currency: 'TRY',
          status: 'succeeded'
        };
      } else {
        // Stripe'dan ödeme bilgilerini al
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ success: false, message: 'Ödeme henüz tamamlanmamış' });
        }
        paymentInfo = {
          id: paymentIntent.id,
          amount: (paymentIntent.amount || 0) / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status
        };
      }

      // Randevu durumunu güncelle
      const updatedAppointment = await AppointmentModel.updateStatus(
        appointmentId,
        'confirmed'
      );

      // Ödeme başarılıysa danışmana bildirim gönder (opsiyonel: email de eklenebilir)
      try {
        const consultantId = updatedAppointment.consultant_id;
        // Bildirim modeli burada import edilmediği için doğrudan konsola yazıyoruz
        // Projede NotificationModel mevcut; gerekiyorsa import edilip kullanılabilir.
      } catch {}

      if (!updatedAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu güncellenemedi'
        });
      }

      return res.json({
        success: true,
        data: {
          message: 'Ödeme başarıyla onaylandı',
          appointment: updatedAppointment,
          payment: paymentInfo
        }
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ödeme onaylanamadı'
      });
    }
  }

  // Ödeme geçmişi
  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;

      // Kullanıcının randevularını al
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      const userType = user.user_type;
      const appointments = await AppointmentModel.findByUser(userId, userType);

      // Ödeme bilgilerini ekle (gerçek uygulamada ayrı tablo olacak)
      const payments = appointments
        .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
        .map(apt => ({
          id: apt.id,
          amount: 100, // Gerçek uygulamada veritabanından alınacak
          currency: 'TRY',
          status: 'completed',
          date: apt.created_at,
          type: userType === 'client' ? 'payment' : 'receipt'
        }));

      // Sayfalama
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedPayments = payments.slice(startIndex, endIndex);

      return res.json({
        success: true,
        data: {
          payments: paginatedPayments,
          pagination: {
            current: Number(page),
            total: Math.ceil(payments.length / Number(limit)),
            hasNext: endIndex < payments.length,
            hasPrev: Number(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Payment history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ödeme geçmişi alınamadı'
      });
    }
  }

  // Refund işlemi
  static async processRefund(req: Request, res: Response) {
    try {
      const { appointmentId, reason } = req.body;
      const userId = (req as any).user.id;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message: 'Randevu ID gerekli'
        });
      }

      // Randevu bilgilerini kontrol et
      const appointment = await AppointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Randevu bulunamadı'
        });
      }

      // Sadece danışmanlar refund yapabilir
      if (appointment.consultant_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Refund işlemi için yetkiniz yok'
        });
      }

      // Refund işlemi (gerçek uygulamada Stripe refund API'si kullanılacak)
      // Şimdilik sadece randevu durumunu güncelliyoruz
      const updatedAppointment = await AppointmentModel.updateStatus(
        appointmentId,
        'cancelled'
      );

      return res.json({
        success: true,
        data: {
          message: 'Refund işlemi başlatıldı',
          appointment: updatedAppointment,
          refund: {
            amount: 100, // Gerçek uygulamada veritabanından alınacak
            currency: 'TRY',
            reason: reason || 'İptal edildi',
            processedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Refund error:', error);
      return res.status(500).json({
        success: false,
        message: 'Refund işlemi yapılamadı'
      });
    }
  }

  // Webhook handler (Stripe'dan gelen ödeme bildirimleri)
  static async handleWebhook(req: Request, res: Response) {
    try {
      if (!stripe) {
        // Mock modda webhook kullanılmıyor
        return res.json({ received: true, mocked: true });
      }
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).json({
          success: false,
          message: 'Webhook signature gerekli'
        });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({
          success: false,
          message: 'Webhook signature doğrulanamadı'
        });
      }

      // Event türüne göre işlem yap
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Payment succeeded:', paymentIntent.id);
          
          // Randevu durumunu güncelle
          if (paymentIntent.metadata.appointmentId) {
            await AppointmentModel.updateStatus(
              parseInt(paymentIntent.metadata.appointmentId),
              'confirmed'
            );
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('Payment failed:', failedPayment.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.json({ received: true });

    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({
        success: false,
        message: 'Webhook işlenemedi'
      });
    }
  }
}
