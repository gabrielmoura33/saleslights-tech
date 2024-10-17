export abstract class ITimerService {
  abstract setTimeout(callback: () => void, milliseconds: number): string;
  abstract clearTimeout(timeoutId: string): void;
}
