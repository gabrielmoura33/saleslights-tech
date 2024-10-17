import { MonitoredService } from '../entities/monitored-service';
import { EscalationPolicy } from '../entities/escalation-policy';
import { Target } from '../entities/targets/target';

export class PagerDomainService {
  shouldProcessAlert(monitoredService: MonitoredService): boolean {
    return monitoredService.isServiceHealthy();
  }

  markServiceUnhealthy(monitoredService: MonitoredService): void {
    monitoredService.markUnhealthy();
  }

  markServiceHealthy(monitoredService: MonitoredService): void {
    monitoredService.markHealthy();
  }

  getTargetsForLevel(
    escalationPolicy: EscalationPolicy,
    levelNumber: number,
  ): Target[] {
    const level = escalationPolicy.getLevel(levelNumber);
    return level ? level.getTargets() : [];
  }

  hasMoreLevels(
    escalationPolicy: EscalationPolicy,
    currentLevel: number,
  ): boolean {
    return currentLevel < escalationPolicy.getMaxLevelNumber();
  }

  getNextLevel(currentLevel: number): number {
    return currentLevel + 1;
  }

  canAcknowledgeAlert(monitoredService: MonitoredService): boolean {
    return !monitoredService.isServiceHealthy();
  }
}
