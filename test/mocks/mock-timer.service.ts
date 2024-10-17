import { ITimerService } from '@application/interfaces/timer-service.interface';

export class MockTimerService implements ITimerService {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  setTimeout(callback: () => void, milliseconds: number): string {
    const id = `timeout-${this.timeouts.size + 1}`;
    const timeout = setTimeout(callback, milliseconds);
    this.timeouts.set(id, timeout);
    return id;
  }

  clearTimeout(timeoutId: string): void {
    const timeout = this.timeouts.get(timeoutId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(timeoutId);
    }
  }

  hasTimeout(timeoutId: string): boolean {
    return this.timeouts.has(timeoutId);
  }
}
