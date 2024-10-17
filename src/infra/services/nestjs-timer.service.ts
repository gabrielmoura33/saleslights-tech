import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ITimerService } from '../../application/interfaces/timer-service.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NestJSTimerService implements ITimerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  setTimeout(callback: () => void, milliseconds: number): string {
    const timeoutId = uuidv4();
    const timeout = setTimeout(() => {
      callback();
      this.schedulerRegistry.deleteTimeout(timeoutId);
    }, milliseconds);

    this.schedulerRegistry.addTimeout(timeoutId, timeout);
    return timeoutId;
  }

  clearTimeout(timeoutId: string): void {
    try {
      this.schedulerRegistry.deleteTimeout(timeoutId);
    } catch (error) {
      console.log(`Timeout com ID ${timeoutId} não encontrado.`);
    }
  }
}
