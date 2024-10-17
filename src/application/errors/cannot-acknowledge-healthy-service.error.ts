export class CannotAcknowledgeHealthyServiceError extends Error {
  constructor(serviceId: string) {
    super(`Cannot acknowledge alert for a healthy service: ${serviceId}`);
    this.name = 'CannotAcknowledgeHealthyServiceError';
  }
}
