import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment';
import { UserModel } from '../models/User';
import { AuthenticatedRequest, CreateAppointmentRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createAppointmentSchema } from '../utils/validation';
import { EmailService } from '../services/emailService';
import { oneSignalService } from '../services/oneSignalService';
import { NotificationModel } from '../models/Notification';
import { isValidDate } from '../utils/validation';

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

  // Ödeme tamamlanana kadar danışmana bildirim göndermeyelim; ödeme onayı sonrası gönderilecek
  
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

  // Önce randevuları al (expired güncellemesi öncesi)
  const appointments = await AppointmentModel.findByUser(user.id, user.user_type);
  
  // Sonra süresi dolmuş randevuları güncelle (background'da)
  AppointmentModel.updateExpiredAppointments().catch(console.error);

  return res.json({ success: true, data: appointments } as ApiResponse);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  
  // Önce randevuyu al (expired güncellemesi öncesi)
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment || (appointment.client_id !== user.id && appointment.consultant_id !== user.id)) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı veya erişim izni yok' } as ApiResponse);
  }

  // Danışmanlar pending randevuları görebilir (onaylama/reddetme için)
  // Sadece expired randevuları göremez
  if (user.user_type === 'consultant' && appointment.status === 'expired') {
    return res.status(403).json({ success: false, error: 'Süresi dolmuş randevu görüntülenemez' } as ApiResponse);
  }

  // Sonra süresi dolmuş randevuları güncelle (background'da)
  AppointmentModel.updateExpiredAppointments().catch(console.error);

  return res.json({ success: true, data: appointment } as ApiResponse);
});

export const approveAppointment = asyncHandler(async (req: Request, res: Response) => {
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

  // Randevuyu onayla
  const updatedAppointment = await AppointmentModel.updateStatus(appointmentId, 'confirmed');
  
  // Müşteriye bildirim gönder
  try {
    await NotificationModel.create({
      user_id: appointment.client_id,
      title: 'Randevu Onaylandı',
      message: `${appointment.consultant?.full_name} adlı danışman randevunuzu onayladı. Tarih: ${new Date(appointment.start_time).toLocaleDateString('tr-TR')} Saat: ${new Date(appointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
      type: 'appointment',
      is_read: false,
      appointment_id: appointment.id,
      action_required: false
    });
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
  }

  return res.json({ success: true, data: updatedAppointment, message: 'Randevu başarıyla onaylandı' } as ApiResponse);
});

export const rejectAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı' } as ApiResponse);
  }

  // Sadece danışman reddedebilir
  if (appointment.consultant_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu randevuyu reddetme yetkiniz yok' } as ApiResponse);
  }

  // Sadece bekleyen randevular reddedilebilir
  if (appointment.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Sadece bekleyen randevular reddedilebilir' } as ApiResponse);
  }

  // Randevuyu reddet
  const updatedAppointment = await AppointmentModel.updateStatus(appointmentId, 'cancelled');
  
  // Müşteriye bildirim gönder
  try {
    await NotificationModel.create({
      user_id: appointment.client_id,
      title: 'Randevu Reddedildi',
      message: `${appointment.consultant?.full_name} adlı danışman randevunuzu reddetti. Tarih: ${new Date(appointment.start_time).toLocaleDateString('tr-TR')} Saat: ${new Date(appointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
      type: 'appointment',
      is_read: false,
      appointment_id: appointment.id,
      action_required: false
    });
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
  }

  return res.json({ success: true, data: updatedAppointment, message: 'Randevu reddedildi' } as ApiResponse);
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

export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const appointmentId = parseInt(req.params.id);
  const { start_time, end_time } = req.body as { start_time?: string; end_time?: string };

  if (!start_time || !end_time || !isValidDate(start_time) || !isValidDate(end_time)) {
    return res.status(400).json({ success: false, error: 'Geçerli başlangıç ve bitiş zamanı gereklidir' } as ApiResponse);
  }

  const appointment = await AppointmentModel.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Randevu bulunamadı' } as ApiResponse);
  }

  // Sadece randevunun sahibi veya danışmanı erteleyebilir
  if (appointment.client_id !== user.id && appointment.consultant_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu randevuyu erteleme yetkiniz yok' } as ApiResponse);
  }

  const updatedAppointment = await AppointmentModel.updateTimes(appointmentId, start_time, end_time, true);

  try {
    await NotificationModel.create({
      user_id: appointment.client_id === user.id ? appointment.consultant_id : appointment.client_id,
      title: 'Randevu Güncellendi',
      message: `${new Date(updatedAppointment.start_time).toLocaleDateString('tr-TR')} ${new Date(updatedAppointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} tarihine ertelendi`,
      type: 'appointment',
      is_read: false,
      appointment_id: appointment.id,
      action_required: true,
      action_type: 'approve'
    });
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
  }

  await EmailService.sendAppointmentUpdateEmail(updatedAppointment);

  return res.json({ success: true, data: updatedAppointment, message: 'Randevu güncellendi' } as ApiResponse);
});

// Dashboard için özel endpoint - otomatik güncelleme ile
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  // Önce randevuları al (expired güncellemesi öncesi)
  const appointments = await AppointmentModel.findByUser(user.id, user.user_type);
  
  // Sonra süresi dolmuş randevuları güncelle (background'da)
  AppointmentModel.updateExpiredAppointments().catch(console.error);

  return res.json({ 
    success: true, 
    data: appointments,
    updatedCount: 0 // Artık real-time güncelleme yapmıyoruz
  } as ApiResponse);
});

// Danışmanın bekleyen randevu talepleri
export const getPendingRequestsForConsultant = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  if (user.user_type !== 'consultant') {
    return res.status(403).json({ success: false, error: 'Sadece danışmanlar bu listeyi görüntüleyebilir' } as ApiResponse);
  }

  // Önce bekleyen talepleri al (expired güncellemesi öncesi)
  const requests = await AppointmentModel.findPendingByConsultant(Number(user.id));
  
  // Sonra süresi dolmuş randevuları güncelle (background'da)
  AppointmentModel.updateExpiredAppointments().catch(console.error);

  return res.json({ success: true, data: requests } as ApiResponse);
});