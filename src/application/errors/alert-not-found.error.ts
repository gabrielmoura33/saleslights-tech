export class AlertNotFoundError extends Error {
  constructor(serviceId: string) {
    super(`Alert not found for service: ${serviceId}`);
    this.name = 'AlertNotFoundError';
  }
}
