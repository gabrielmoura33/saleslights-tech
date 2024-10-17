export abstract class Target {
  abstract getContactInfo(): string;
  abstract getNotificationMethod(): NotificationMethod;
}

export enum NotificationMethod {
  Email = 'Email',
  SMS = 'SMS',
}
