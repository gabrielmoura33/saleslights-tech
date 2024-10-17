import { Alert } from '@domain/entities/alert';
import { Target } from '@domain/entities/targets/target';

export abstract class INotificationService {
  abstract sendEmail(to: string, subject: string, body: string): Promise<void>;
  abstract sendSMS(to: string, message: string): Promise<void>;
  abstract sendNotification(target: Target, alert: Alert): Promise<void>;
}
