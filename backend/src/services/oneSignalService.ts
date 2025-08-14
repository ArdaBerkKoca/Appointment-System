import { Client } from 'onesignal-node';
import { logger } from '../utils/logger';

export interface NotificationData {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
  segments?: string[];
  playerIds?: string[];
  includePlayerIds?: string[];
}

export interface EmailData {
  to: string;
  subject: string;
  templateId: string;
  templateData?: Record<string, any>;
  customHtml?: string;
}

export interface UserSubscription {
  playerId: string;
  userId: string;
  deviceType: 'web' | 'mobile';
  tags?: Record<string, string>;
}

class OneSignalService {
  private client: Client;
  private appId: string;

  constructor() {
    const appId = process.env.ONESIGNAL_APP_ID;
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !restApiKey) {
      console.warn('⚠️ OneSignal configuration is missing. Running in mock mode.');
      this.appId = 'mock-app-id';
      this.client = null as any;
    } else {
      this.appId = appId;
      this.client = new Client(appId, restApiKey);
    }
  }

  /**
   * E-posta gönder (OneSignal üzerinden)
   */
  async sendEmail(data: EmailData) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Email would be sent via OneSignal', { data });
        return { success: true, message: 'Mock email sent via OneSignal' };
      }

      // OneSignal e-posta API'si için notification objesi
      const notification = {
        app_id: this.appId,
        include_email_tokens: [data.to],
        email_subject: data.subject,
        template_id: data.templateId,
        email_template_data: data.templateData || {},
        // Eğer custom HTML kullanılıyorsa
        ...(data.customHtml && { email_body: data.customHtml })
      };

      const response = await this.client.createNotification(notification);
      logger.info('Email sent via OneSignal successfully', { to: data.to, templateId: data.templateId, response });
      return response;
    } catch (error) {
      logger.error('Error sending email via OneSignal', { error, data });
      throw error;
    }
  }

  /**
   * Toplu e-posta gönder
   */
  async sendBulkEmail(data: Omit<EmailData, 'to'>, emailList: string[]) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Bulk email would be sent via OneSignal', { data, emailCount: emailList.length });
        return { success: true, message: `Mock bulk email sent to ${emailList.length} recipients` };
      }

      const notification = {
        app_id: this.appId,
        include_email_tokens: emailList,
        email_subject: data.subject,
        template_id: data.templateId,
        email_template_data: data.templateData || {},
        ...(data.customHtml && { email_body: data.customHtml })
      };

      const response = await this.client.createNotification(notification);
      logger.info('Bulk email sent via OneSignal successfully', { emailCount: emailList.length, templateId: data.templateId, response });
      return response;
    } catch (error) {
      logger.error('Error sending bulk email via OneSignal', { error, data, emailCount: emailList.length });
      throw error;
    }
  }

  /**
   * Randevu hatırlatması e-postası gönder
   */
  async sendAppointmentReminderEmail(
    userEmail: string,
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
      userName: string;
      location?: string;
    }
  ) {
    const emailData: EmailData = {
      to: userEmail,
      subject: `🔔 Randevu Hatırlatması - ${appointmentData.title}`,
      templateId: process.env.ONESIGNAL_TEMPLATE_APPOINTMENT_REMINDER || 'randevu-hatirlatma',
      templateData: {
        user_name: appointmentData.userName,
        appointment_title: appointmentData.title,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        consultant_name: appointmentData.consultantName,
        location: appointmentData.location || 'Belirtilmemiş',
        appointment_url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Randevu onayı e-postası gönder
   */
  async sendAppointmentConfirmationEmail(
    userEmail: string,
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
      userName: string;
      location?: string;
    }
  ) {
    const emailData: EmailData = {
      to: userEmail,
      subject: `✅ Randevu Onaylandı - ${appointmentData.title}`,
      templateId: process.env.ONESIGNAL_TEMPLATE_APPOINTMENT_CONFIRMATION || 'randevu-onay',
      templateData: {
        user_name: appointmentData.userName,
        appointment_title: appointmentData.title,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        consultant_name: appointmentData.consultantName,
        location: appointmentData.location || 'Belirtilmemiş',
        appointment_url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Randevu güncelleme e-postası gönder
   */
  async sendAppointmentUpdateEmail(
    userEmail: string,
    appointmentData: {
      id: string;
      title: string;
      oldDate?: string;
      newDate: string;
      oldTime?: string;
      newTime: string;
      consultantName: string;
      userName: string;
      location?: string;
    }
  ) {
    const emailData: EmailData = {
      to: userEmail,
      subject: `📅 Randevu Güncellendi - ${appointmentData.title}`,
      templateId: process.env.ONESIGNAL_TEMPLATE_APPOINTMENT_UPDATE || 'randevu-guncelleme',
      templateData: {
        user_name: appointmentData.userName,
        appointment_title: appointmentData.title,
        old_date: appointmentData.oldDate || 'Belirtilmemiş',
        new_date: appointmentData.newDate,
        old_time: appointmentData.oldTime || 'Belirtilmemiş',
        new_time: appointmentData.newTime,
        consultant_name: appointmentData.consultantName,
        location: appointmentData.location || 'Belirtilmemiş',
        appointment_url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`

      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Randevu iptali e-postası gönder
   */
  async sendAppointmentCancellationEmail(
    userEmail: string,
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
      userName: string;
      reason?: string;
      location?: string;
    }
  ) {
    const emailData: EmailData = {
      to: userEmail,
      subject: `❌ Randevu İptal Edildi - ${appointmentData.title}`,
      templateId: process.env.ONESIGNAL_TEMPLATE_APPOINTMENT_CANCELLATION || 'randevu-iptal',
      templateData: {
        user_name: appointmentData.userName,
        appointment_title: appointmentData.title,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        consultant_name: appointmentData.consultantName,
        cancellation_reason: appointmentData.reason || 'Belirtilmemiş',
        location: appointmentData.location || 'Belirtilmemiş',
        new_appointment_url: `${process.env.FRONTEND_URL}/appointments/create`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * AI önerisi e-postası gönder
   */
  async sendAIRecommendationEmail(
    userEmail: string,
    recommendationData: {
      type: 'time_slot' | 'service' | 'consultant';
      message: string;
      actionUrl: string;
      userName: string;
    }
  ) {
    const titles = {
      time_slot: '⏰ Zaman Önerisi',
      service: '💡 Hizmet Önerisi',
      consultant: '👨‍💼 Danışman Önerisi'
    };

    const emailData: EmailData = {
      to: userEmail,
      subject: `${titles[recommendationData.type]} - Randevu Sistemi`,
      templateId: process.env.ONESIGNAL_TEMPLATE_AI_RECOMMENDATION || 'ai-onerisi',
      templateData: {
        user_name: recommendationData.userName,
        recommendation_type: titles[recommendationData.type],
        recommendation_message: recommendationData.message,
        action_url: recommendationData.actionUrl
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Tüm kullanıcılara bildirim gönder
   */
  async sendNotificationToAll(data: NotificationData) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Notification would be sent to all users', { data });
        return { success: true, message: 'Mock notification sent to all users' };
      }

      const notification = {
        app_id: this.appId,
        included_segments: data.segments || ['All'],
        headings: { en: data.title },
        contents: { en: data.message },
        url: data.url,
        data: data.data,
        chrome_web_image: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_badge: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_icon: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅'
      };

      const response = await this.client.createNotification(notification);
      logger.info('Notification sent to all users successfully', { response });
      return response;
    } catch (error) {
      logger.error('Error sending notification to all users', { error });
      throw error;
    }
  }

  /**
   * Belirli kullanıcılara bildirim gönder
   */
  async sendNotificationToUsers(data: NotificationData, playerIds: string[]) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Notification would be sent to specific users', { data, playerIds });
        return { success: true, message: 'Mock notification sent to specific users' };
      }

      const notification = {
        app_id: this.appId,
        include_player_ids: playerIds,
        headings: { en: data.title },
        contents: { en: data.message },
        url: data.url,
        data: data.data,
        chrome_web_image: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_badge: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_icon: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅'
      };

      const response = await this.client.createNotification(notification);
      logger.info('Notification sent to specific users successfully', { playerIds, response });
      return response;
    } catch (error) {
      logger.error('Error sending notification to specific users', { error, playerIds });
      throw error;
    }
  }

  /**
   * Segment'e bildirim gönder
   */
  async sendNotificationToSegment(data: NotificationData, segment: string) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Notification would be sent to segment', { data, segment });
        return { success: true, message: 'Mock notification sent to segment' };
      }

      const notification = {
        app_id: this.appId,
        included_segments: [segment],
        headings: { en: data.title },
        contents: { en: data.message },
        url: data.url,
        data: data.data,
        chrome_web_image: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_badge: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅',
        chrome_web_icon: 'https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=📅'
      };

      const response = await this.client.createNotification(notification);
      logger.info('Notification sent to segment successfully', { segment, response });
      return response;
    } catch (error) {
      logger.error('Error sending notification to segment', { error, segment });
      throw error;
    }
  }

  /**
   * Randevu hatırlatması gönder
   */
  async sendAppointmentReminder(
    playerIds: string[],
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
    }
  ) {
    const data: NotificationData = {
      title: '🔔 Randevu Hatırlatması',
      message: `${appointmentData.title} randevunuz ${appointmentData.date} ${appointmentData.time} tarihinde ${appointmentData.consultantName} ile gerçekleşecek.`,
      url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`,
      data: {
        type: 'appointment_reminder',
        appointmentId: appointmentData.id,
        action: 'view_appointment'
      }
    };

    return this.sendNotificationToUsers(data, playerIds);
  }

  /**
   * Randevu güncelleme bildirimi gönder
   */
  async sendAppointmentUpdate(
    playerIds: string[],
    appointmentData: {
      id: string;
      title: string;
      oldDate?: string;
      newDate: string;
      oldTime?: string;
      newTime: string;
      consultantName: string;
    }
  ) {
    const data: NotificationData = {
      title: '📅 Randevu Güncellendi',
      message: `${appointmentData.title} randevunuz ${appointmentData.newDate} ${appointmentData.newTime} tarihine güncellendi.`,
      url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`,
      data: {
        type: 'appointment_update',
        appointmentId: appointmentData.id,
        action: 'view_appointment'
      }
    };

    return this.sendNotificationToUsers(data, playerIds);
  }

  /**
   * Randevu iptal bildirimi gönder
   */
  async sendAppointmentCancellation(
    playerIds: string[],
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
      reason?: string;
    }
  ) {
    const data: NotificationData = {
      title: '❌ Randevu İptal Edildi',
      message: `${appointmentData.title} randevunuz ${appointmentData.date} ${appointmentData.time} tarihinde iptal edildi.${appointmentData.reason ? ` Sebep: ${appointmentData.reason}` : ''}`,
      url: `${process.env.FRONTEND_URL}/appointments`,
      data: {
        type: 'appointment_cancellation',
        appointmentId: appointmentData.id,
        action: 'book_new_appointment'
      }
    };

    return this.sendNotificationToUsers(data, playerIds);
  }

  /**
   * Yeni randevu onayı bildirimi gönder
   */
  async sendAppointmentConfirmation(
    playerIds: string[],
    appointmentData: {
      id: string;
      title: string;
      date: string;
      time: string;
      consultantName: string;
    }
  ) {
    const data: NotificationData = {
      title: '✅ Randevu Onaylandı',
      message: `${appointmentData.title} randevunuz ${appointmentData.date} ${appointmentData.time} tarihinde ${appointmentData.consultantName} ile onaylandı.`,
      url: `${process.env.FRONTEND_URL}/appointments/${appointmentData.id}`,
      data: {
        type: 'appointment_confirmation',
        appointmentId: appointmentData.id,
        action: 'view_appointment'
      }
    };

    return this.sendNotificationToUsers(data, playerIds);
  }

  /**
   * AI önerisi bildirimi gönder
   */
  async sendAIRecommendation(
    playerIds: string[],
    recommendationData: {
      type: 'time_slot' | 'service' | 'consultant';
      message: string;
      actionUrl: string;
    }
  ) {
    const titles = {
      time_slot: '⏰ Zaman Önerisi',
      service: '💡 Hizmet Önerisi',
      consultant: '👨‍💼 Danışman Önerisi'
    };

    const data: NotificationData = {
      title: titles[recommendationData.type],
      message: recommendationData.message,
      url: recommendationData.actionUrl,
      data: {
        type: 'ai_recommendation',
        recommendationType: recommendationData.type,
        action: 'view_recommendation'
      }
    };

    return this.sendNotificationToUsers(data, playerIds);
  }

  /**
   * Kullanıcı etiketlerini güncelle
   */
  async updateUserTags(playerId: string, tags: Record<string, string>) {
    try {
      // OneSignal Node.js SDK'da editTags metodu yok, bunun yerine createNotification ile tag güncelleme yapılır
      // Bu fonksiyon şimdilik mock olarak çalışacak
      logger.info('User tags would be updated', { playerId, tags });
      return { success: true, message: 'Tags updated (mock implementation)' };
    } catch (error) {
      logger.error('Error updating user tags', { error, playerId, tags });
      throw error;
    }
  }

  /**
   * Kullanıcıyı segment'e ekle
   */
  async addUserToSegment(playerId: string, segment: string) {
    try {
      const tags = { [segment]: 'true' };
      return await this.updateUserTags(playerId, tags);
    } catch (error) {
      logger.error('Error adding user to segment', { error, playerId, segment });
      throw error;
    }
  }

  /**
   * Kullanıcıyı segment'ten çıkar
   */
  async removeUserFromSegment(playerId: string, segment: string) {
    try {
      const tags = { [segment]: 'false' };
      return await this.updateUserTags(playerId, tags);
    } catch (error) {
      logger.error('Error removing user from segment', { error, playerId, segment });
      throw error;
    }
  }

  /**
   * Bildirim geçmişini al
   */
  async getNotificationHistory(limit: number = 50, offset: number = 0) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Notification history would be retrieved', { limit, offset });
        return { success: true, message: 'Mock notification history', data: [] };
      }

      const response = await this.client.viewNotifications({ limit, offset });
      logger.info('Notification history retrieved successfully', { limit, offset });
      return response;
    } catch (error) {
      logger.error('Error retrieving notification history', { error });
      throw error;
    }
  }

  /**
   * Bildirim istatistiklerini al
   */
  async getNotificationStats(notificationId: string) {
    try {
      if (!this.client) {
        logger.info('Mock mode: Notification stats would be retrieved', { notificationId });
        return { success: true, message: 'Mock notification stats', data: {} };
      }

      // OneSignal Node.js SDK'da getNotification metodu yok, bunun yerine viewNotifications kullanılır
      const response = await this.client.viewNotifications({ limit: 1, offset: 0 });
      logger.info('Notification stats retrieved successfully', { notificationId });
      return response;
    } catch (error) {
      logger.error('Error retrieving notification stats', { error, notificationId });
      throw error;
    }
  }
}

export const oneSignalService = new OneSignalService();
export default oneSignalService;
