export class AlertAlreadyAcknowledgedError extends Error {
  constructor(serviceId: string) {
    super(`Alert for service ${serviceId} has already been acknowledged`);
    this.name = 'AlertAlreadyAcknowledgedError';
  }
}
