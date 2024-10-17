import { INotificationService } from '@application/interfaces/notification-service.interface';
import { Target, NotificationMethod } from '@domain/entities/targets/target';
import { Alert } from '@domain/entities/alert';

export class MockNotificationService implements INotificationService {
  public notifications: Array<{ method: string; to: string; message: string }> =
    [];

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.notifications.push({ method: 'Email', to, message: body });
  }

  async sendSMS(to: string, message: string): Promise<void> {
    this.notifications.push({ method: 'SMS', to, message });
  }

  async sendNotification(target: Target, alert: Alert): Promise<void> {
    const contactInfo = target.getContactInfo();
    const notificationMethod = target.getNotificationMethod();
    const message = alert.getMessage().toString();

    if (notificationMethod === NotificationMethod.Email) {
      await this.sendEmail(contactInfo, 'Alert Notification', message);
    } else if (notificationMethod === NotificationMethod.SMS) {
      await this.sendSMS(contactInfo, message);
    }
  }
}
