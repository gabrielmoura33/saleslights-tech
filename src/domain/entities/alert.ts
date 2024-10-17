import { AlertMessage } from '../value-objects/alert-message';

export class Alert {
  private readonly message: AlertMessage;
  private readonly serviceId: string;

  constructor(message: AlertMessage, serviceId: string) {
    this.message = message;
    this.serviceId = serviceId;
  }

  getMessage(): AlertMessage {
    return this.message;
  }

  getServiceId(): string {
    return this.serviceId;
  }
}
