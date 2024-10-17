import { EmptyAlertMessageError } from '../errors/empty-alert-message.error';

export class AlertMessage {
  private readonly message: string;

  constructor(message: string) {
    if (!message || message.trim() === '') {
      throw new EmptyAlertMessageError();
    }
    this.message = message;
  }

  toString(): string {
    return this.message;
  }

  equals(other: AlertMessage): boolean {
    return this.message === other.message;
  }
}
