import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const notifications = await NotificationModel.findByUser(user.id, limit);
  return res.json({ success: true, data: notifications } as ApiResponse);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const notificationId = parseInt(req.params.id);
  const notification = await NotificationModel.findById(notificationId);

  if (!notification) {
    return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' } as ApiResponse);
  }

  if (notification.user_id !== user.id) {
    return res.status(403).json({ success: false, error: 'Bu bildirimi okuma yetkiniz yok' } as ApiResponse);
  }

  const updatedNotification = await NotificationModel.markAsRead(notificationId);
  return res.json({ success: true, data: updatedNotification } as ApiResponse);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  await NotificationModel.markAllAsRead(user.id);
  return res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' } as ApiResponse);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not authenticated' } as ApiResponse);
  }

  const count = await NotificationModel.getUnreadCount(user.id);
  return res.json({ success: true, data: { count } } as ApiResponse);
});
