import { Target } from './targets/target';

export class EscalationLevel {
  private readonly levelNumber: number;
  private readonly targets: Target[];

  constructor(levelNumber: number, targets: Target[]) {
    this.levelNumber = levelNumber;
    this.targets = targets;
  }

  getLevelNumber(): number {
    return this.levelNumber;
  }

  getTargets(): Target[] {
    return this.targets;
  }
}
