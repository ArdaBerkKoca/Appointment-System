import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';
import { createAppointment, getAppointments, getAppointmentById, cancelAppointment, confirmAppointment, completeAppointment, getDashboardData, approveAppointment, rejectAppointment, rescheduleAppointment } from '../controllers/appointmentController';

const router = Router();

router.use(authenticateToken);
router.use(requireAnyUser);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/dashboard', getDashboardData);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/confirm', confirmAppointment);
router.put('/:id/complete', completeAppointment);
router.put('/:id/approve', approveAppointment);
router.put('/:id/reject', rejectAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

export default router; 