import { Target, NotificationMethod } from './target';
import { PhoneNumber } from '../../value-objects/phone-number';

export class SMSTarget implements Target {
  private readonly phoneNumber: PhoneNumber;

  constructor(phoneNumber: PhoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  getContactInfo(): string {
    return this.phoneNumber.toString();
  }

  getNotificationMethod(): NotificationMethod {
    return NotificationMethod.SMS;
  }
}
