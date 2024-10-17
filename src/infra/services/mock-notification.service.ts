import { Alert } from '@domain/entities/alert';
import { Target, NotificationMethod } from '@domain/entities/targets/target';
import { INotificationService } from '@application/interfaces/notification-service.interface';
import { NotificationFailedError } from '@application/errors/notification-failed';

export class MockNotificationService implements INotificationService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(
      `
       MockNotificationService: Email enviado para ${to} com o assunto "${subject}"
       Body: "${body}"
      `,
    );
  }

  async sendSMS(to: string, message: string): Promise<void> {
    console.log(
      `MockNotificationService: SMS enviado para ${to} com a mensagem "${message}"`,
    );
  }

  async sendNotification(target: Target, alert: Alert): Promise<void> {
    try {
      const contactInfo = target.getContactInfo();
      const notificationMethod = target.getNotificationMethod();
      const message = alert.getMessage().toString();

      if (notificationMethod === NotificationMethod.Email) {
        await this.sendEmail(contactInfo, 'Alert Notification', message);
      } else if (notificationMethod === NotificationMethod.SMS) {
        await this.sendSMS(contactInfo, message);
      } else {
        throw new NotificationFailedError(
          contactInfo,
          'Unknown notification method',
        );
      }
    } catch (error: any) {
      throw new NotificationFailedError(target.getContactInfo(), error.message);
    }
  }
}
