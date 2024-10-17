export class NotificationFailedError extends Error {
  constructor(target: string, reason: string) {
    super(`Failed to notify target ${target}: ${reason}`);
    this.name = 'NotificationFailedError';
  }
}
