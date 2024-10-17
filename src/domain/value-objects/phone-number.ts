import { InvalidPhoneNumberError } from '../errors/invalid-phone-number.error';

export class PhoneNumber {
  private readonly number: string;

  constructor(number: string) {
    if (!this.validatePhoneNumber(number)) {
      throw new InvalidPhoneNumberError(number);
    }
    this.number = number;
  }

  private validatePhoneNumber(number: string): boolean {
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(number);
  }

  toString(): string {
    return this.number;
  }

  equals(other: PhoneNumber): boolean {
    return this.number === other.number;
  }
}
