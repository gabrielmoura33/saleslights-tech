export class EmptyAlertMessageError extends Error {
  constructor() {
    super('Alert message cannot be empty');
    this.name = 'EmptyAlertMessageError';
  }
}
