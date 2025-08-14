import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment';
import { UserModel } from '../models/User';
import { AuthenticatedRequest, CreateAppointmentRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createAppointmentSchema } from '../utils/validation';
import { EmailService } from '../services/emailService';
import { oneSignalService } from '../services/oneSignalService';

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  // Danışman kendisinden randevu alamaz
  if (user.user_type === 'consultant') {
    return res.status(403).json({ success: false, error: 'Danışmanlar kendilerinden randevu alamaz' } as ApiResponse);
  }

  const appointmentData = validate(createAppointmentSchema, req.body) as CreateAppointmentRequest;

  const appointment = await AppointmentModel.create(appointmentData, user.id);
  
  // E-posta bildirimi gönder
  await EmailService.sendAppointmentCreatedEmail(appointment);
  
          // OneSignal e-posta bildirimi gönder
        try {
          const user = await UserModel.findById(appointment.client_id);
          if (user && user.email) {
            await oneSignalService.sendAppointmentConfirmationEmail(user.email, {
              id: appointment.id.toString(),
              title: `Randevu - ${appointment.notes || 'Danışmanlık'}`,
              date: appointment.start_time.toLocaleDateString('tr-TR'),
              time: appointment.start_time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              consultantName: appointment.consultant?.full_name || 'Belirtilmemiş',
              userName: user.full_name || 'Kullanıcı',
              location: 'Online / Ofis'
            });
          }
        } catch (error) {
          console.error('OneSignal e-posta gönderme hatası:', error);
        }
  
  return res.status(201).json({ success: true, data: appointment, message: 'Randevu başarıyla oluşturuldu' } as ApiResponse);
});

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  // Süresi dolmuş randevuları otomatik olarak tamamlandı olarak işaretle
  await AppointmentModel.updateExpiredAppointments();

  const appointments = await AppointmentModel.findByUser(user.id, user.user_type);
  return res.json({ success: true, data: appointments } as ApiResponse);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  
  // Önce süresi dolmuş randevuları güncelle
  await AppointmentModel.updateExpiredAppointments();
  
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment || (appointment.client_id !== user.id && appointment.consultant_id !== user.id)) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı veya erişim izni yok' } as ApiResponse);
  }

  return res.json({ success: true, data: appointment } as ApiResponse);
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı' } as ApiResponse);
  }

  // Sadece randevunun sahibi veya danışmanı iptal edebilir
  if (appointment.client_id !== user.id && appointment.consultant_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu randevuyu iptal etme yetkiniz yok' } as ApiResponse);
  }

  // Sadece bekleyen randevular iptal edilebilir
  if (appointment.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Sadece bekleyen randevular iptal edilebilir' } as ApiResponse);
  }

  const updatedAppointment = await AppointmentModel.updateStatus(appointmentId, 'cancelled');
  
  // E-posta bildirimi gönder
  await EmailService.sendAppointmentCancelledEmail(updatedAppointment);
  
  // OneSignal e-posta bildirimi gönder
  try {
    const user = await UserModel.findById(updatedAppointment.client_id);
    if (user && user.email) {
      await oneSignalService.sendAppointmentCancellationEmail(user.email, {
        id: updatedAppointment.id.toString(),
        title: `Randevu - ${updatedAppointment.notes || 'Danışmanlık'}`,
        date: updatedAppointment.start_time.toLocaleDateString('tr-TR'),
        time: updatedAppointment.start_time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        consultantName: updatedAppointment.consultant?.full_name || 'Belirtilmemiş',
        userName: user.full_name || 'Kullanıcı',
        reason: req.body.reason,
        location: 'Online / Ofis'
      });
    }
  } catch (error) {
    console.error('OneSignal e-posta gönderme hatası:', error);
  }
  
  return res.json({ success: true, data: updatedAppointment, message: 'Randevu başarıyla iptal edildi' } as ApiResponse);
});

export const confirmAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı' } as ApiResponse);
  }

  // Sadece danışman onaylayabilir
  if (appointment.consultant_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu randevuyu onaylama yetkiniz yok' } as ApiResponse);
  }

  // Sadece bekleyen randevular onaylanabilir
  if (appointment.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Sadece bekleyen randevular onaylanabilir' } as ApiResponse);
  }

  const updatedAppointment = await AppointmentModel.updateStatus(appointmentId, 'confirmed');
  
  // E-posta bildirimi gönder
  await EmailService.sendAppointmentConfirmedEmail(updatedAppointment);
  
  return res.json({ success: true, data: updatedAppointment, message: 'Randevu başarıyla onaylandı' } as ApiResponse);
});

export const completeAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı' } as ApiResponse);
  }

  // Sadece danışman tamamlayabilir
  if (appointment.consultant_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu randevuyu tamamlama yetkiniz yok' } as ApiResponse);
  }

  // Sadece onaylanmış randevular tamamlanabilir
  if (appointment.status !== 'confirmed') {
    return res.status(400).json({ success: false, error: 'Sadece onaylanmış randevular tamamlanabilir' } as ApiResponse);
  }

  const updatedAppointment = await AppointmentModel.updateStatus(appointmentId, 'completed');
  return res.json({ success: true, data: updatedAppointment, message: 'Randevu başarıyla tamamlandı' } as ApiResponse);
});

// Dashboard için özel endpoint - otomatik güncelleme ile
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  // Süresi dolmuş randevuları otomatik olarak tamamlandı olarak işaretle
  const updatedCount = await AppointmentModel.updateExpiredAppointments();

  const appointments = await AppointmentModel.findByUser(user.id, user.user_type);
  return res.json({ 
    success: true, 
    data: appointments,
    updatedCount 
  } as ApiResponse);
});
