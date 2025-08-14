import { AppointmentModel } from '../models/Appointment';
import { logger } from './logger';

class AppointmentScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 dakika

  start() {
    if (this.intervalId) {
      logger.info('Appointment scheduler already running');
      return;
    }

    logger.info('Starting appointment scheduler...');
    
    this.intervalId = setInterval(async () => {
      try {
        const updatedCount = await AppointmentModel.updateExpiredAppointments();
        if (updatedCount > 0) {
          logger.info(`Updated ${updatedCount} expired appointments to completed status`);
        }
      } catch (error) {
        logger.error('Error updating expired appointments:', error);
      }
    }, this.CHECK_INTERVAL);

    // İlk çalıştırma
    this.checkExpiredAppointments();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Appointment scheduler stopped');
    }
  }

  private async checkExpiredAppointments() {
    try {
      const updatedCount = await AppointmentModel.updateExpiredAppointments();
      if (updatedCount > 0) {
        logger.info(`Updated ${updatedCount} expired appointments to completed status`);
      }
    } catch (error) {
      logger.error('Error checking expired appointments:', error);
    }
  }
}

export const appointmentScheduler = new AppointmentScheduler();
