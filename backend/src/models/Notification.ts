import getDatabase from '../config/database';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'appointment' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  appointment_id?: number;
  action_required?: boolean;
  action_type?: 'approve' | 'reject' | 'reschedule';
}

export class NotificationModel {
  static async create(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { user_id, title, message, type, is_read, appointment_id, action_required, action_type } = notificationData;
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, action_required, action_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(user_id, title, message, type, is_read ? 1 : 0, appointment_id || null, action_required ? 1 : 0, action_type || null);
    
    const notification = await this.findById(result.lastInsertRowid as number);
    if (!notification) {
      throw new Error('Bildirim oluşturulamadı');
    }
    return notification;
  }

  static async findByUser(userId: number, limit: number = 50): Promise<Notification[]> {
    const db = getDatabase();
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, limit) as any[];
    
    return notifications.map(notification => ({
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: Boolean(notification.is_read),
      created_at: notification.created_at,
      appointment_id: notification.appointment_id,
      action_required: Boolean(notification.action_required),
      action_type: notification.action_type
    }));
  }

  static async findById(id: number): Promise<Notification | null> {
    const db = getDatabase();
    const notification = db.prepare(`
      SELECT * FROM notifications WHERE id = ?
    `).get(id) as any;
    
    if (!notification) return null;
    
    return {
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: Boolean(notification.is_read),
      created_at: notification.created_at,
      appointment_id: notification.appointment_id,
      action_required: Boolean(notification.action_required),
      action_type: notification.action_type
    };
  }

  static async markAsRead(id: number): Promise<Notification> {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ?
    `).run(id);
    
    if (result.changes === 0) {
      throw new Error('Bildirim güncellenemedi');
    }
    
    const notification = await this.findById(id);
    if (!notification) {
      throw new Error('Güncellenmiş bildirim bulunamadı');
    }
    return notification;
  }

  static async markAllAsRead(userId: number): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ?
    `).run(userId);
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(userId) as { count: number };
    
    return result.count;
  }

  static async deleteOldNotifications(userId: number, daysOld: number = 30): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      DELETE FROM notifications 
      WHERE user_id = ? AND created_at < datetime('now', '-${daysOld} days')
    `).run(userId);
  }
}
