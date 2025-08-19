import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

// Ödeme intent oluştur
router.post('/create-intent', authenticateToken, PaymentController.createPaymentIntent);

// Ödeme onayı
router.post('/confirm', authenticateToken, PaymentController.confirmPayment);

// Ödeme geçmişi
router.get('/history', authenticateToken, PaymentController.getPaymentHistory);

// Refund işlemi
router.post('/refund', authenticateToken, PaymentController.processRefund);

// Webhook route is registered in `index.ts` with express.raw for Stripe signature verification

export default router;
