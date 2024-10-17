export class InvalidPhoneNumberError extends Error {
  constructor(number: string) {
    super(`Invalid phone number: ${number}`);
    this.name = 'InvalidPhoneNumberError';
  }
}
