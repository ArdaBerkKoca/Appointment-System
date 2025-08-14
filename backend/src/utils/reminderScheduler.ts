import { AppointmentModel } from '../models/Appointment';
import { EmailService } from '../services/emailService';
import { logger } from './logger';

class ReminderScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // 1 saat

  start() {
    if (this.intervalId) {
      logger.info('Reminder scheduler already running');
      return;
    }

    logger.info('Starting reminder scheduler...');
    
    this.intervalId = setInterval(async () => {
      try {
        await this.checkAndSendReminders();
      } catch (error) {
        logger.error('Error in reminder scheduler:', error);
      }
    }, this.CHECK_INTERVAL);

    // İlk çalıştırma
    this.checkAndSendReminders();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Reminder scheduler stopped');
    }
  }

  private async checkAndSendReminders() {
    try {
      // Yarın randevusu olan kullanıcıları bul
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Yarınki randevuları al
      const appointments = await AppointmentModel.findByDateRange(tomorrow, dayAfterTomorrow);
      
      // Sadece onaylanmış randevular için hatırlatma gönder
      const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
      
      if (confirmedAppointments.length > 0) {
        const result = await EmailService.sendBulkReminderEmails(confirmedAppointments);
        logger.info(`Reminder emails sent: ${result.successful} successful, ${result.failed} failed`);
      } else {
        logger.info('No confirmed appointments for tomorrow, no reminders sent');
      }
    } catch (error) {
      logger.error('Error checking and sending reminders:', error);
    }
  }
}

export const reminderScheduler = new ReminderScheduler();
