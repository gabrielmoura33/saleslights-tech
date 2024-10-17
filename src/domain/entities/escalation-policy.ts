import { EscalationLevel } from './escalation-level';

export class EscalationPolicy {
  private readonly serviceId: string;
  private readonly levels: EscalationLevel[];

  constructor(serviceId: string, levels: EscalationLevel[]) {
    this.serviceId = serviceId;
    this.levels = levels;
  }

  getServiceId(): string {
    return this.serviceId;
  }

  getLevels(): EscalationLevel[] {
    return this.levels;
  }

  getLevel(levelNumber: number): EscalationLevel | undefined {
    return this.levels.find((level) => level.getLevelNumber() === levelNumber);
  }

  getMaxLevelNumber(): number {
    return this.levels.length;
  }
}
