export class InvalidEmailAddressError extends Error {
  constructor(email: string) {
    super(`Invalid email address: ${email}`);
    this.name = 'InvalidEmailAddressError';
  }
}
