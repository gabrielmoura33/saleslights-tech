import { InvalidEmailAddressError } from '../errors/invalid-email-address.error';

export class EmailAddress {
  private readonly email: string;

  constructor(email: string) {
    if (!this.validateEmail(email)) {
      throw new InvalidEmailAddressError(email);
    }
    this.email = email;
  }

  private validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  toString(): string {
    return this.email;
  }

  equals(other: EmailAddress): boolean {
    return this.email === other.email;
  }
}
