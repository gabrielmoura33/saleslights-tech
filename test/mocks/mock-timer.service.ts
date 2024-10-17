import { ITimerService } from '../../src/application/interfaces/timer-service.interface';

export class MockTimerService implements ITimerService {
  private timeouts: Map<
    string,
    { timeout: NodeJS.Timeout; callback: () => void }
  > = new Map();

  setTimeout(callback: () => void, milliseconds: number): string {
    const id = `timeout-${this.timeouts.size + 1}`;
    const timeout = setTimeout(callback, milliseconds);
    this.timeouts.set(id, { timeout, callback });
    return id;
  }

  clearTimeout(timeoutId: string): void {
    const timeout = this.timeouts.get(timeoutId);
    if (timeout) {
      clearTimeout(timeout.timeout);
      this.timeouts.delete(timeoutId);
    }
  }

  hasTimeout(timeoutId: string): boolean {
    return this.timeouts.has(timeoutId);
  }

  triggerTimeout(timeoutId: string): void {
    const entry = this.timeouts.get(timeoutId);
    if (entry) {
      clearTimeout(entry.timeout);
      entry.callback();
      this.timeouts.delete(timeoutId);
    }
  }
}
