export class ServiceNotFoundError extends Error {
  constructor(serviceId: string) {
    super(`Service not found: ${serviceId}`);
    this.name = 'ServiceNotFoundError';
  }
}
