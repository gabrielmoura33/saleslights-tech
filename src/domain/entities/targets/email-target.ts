import { Target, NotificationMethod } from './target';
import { EmailAddress } from '../../value-objects/email-adress';

export class EmailTarget implements Target {
  private readonly emailAddress: EmailAddress;

  constructor(emailAddress: EmailAddress) {
    this.emailAddress = emailAddress;
  }

  getContactInfo(): string {
    return this.emailAddress.toString();
  }

  getNotificationMethod(): NotificationMethod {
    return NotificationMethod.Email;
  }
}
