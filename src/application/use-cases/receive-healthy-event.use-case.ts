import { Injectable } from '@nestjs/common';
import { MonitoredService } from '../../domain/entities/monitored-service';
import { PagerDomainService } from '../../domain/services/pager-domain.service';
import { ITimerService } from '../interfaces/timer-service.interface';
import { Alert } from '@domain/entities/alert';

@Injectable()
export class ReceiveHealthyEventUseCase {
  constructor(
    private readonly pagerDomainService: PagerDomainService,
    private readonly timerService: ITimerService,
  ) {}

  execute(
    serviceId: string,
    monitoredServices: Map<string, MonitoredService>,
    currentLevels: Map<string, number>,
    currentAlerts: Map<string, Alert>,
    acknowledgedServices: Set<string>,
    alertTimers: Map<string, string>,
  ): void {
    const monitoredService = monitoredServices.get(serviceId);
    if (monitoredService) {
      this.pagerDomainService.markServiceHealthy(monitoredService);

      // Limpar timeout
      const timeoutId = alertTimers.get(serviceId);
      if (timeoutId) {
        this.timerService.clearTimeout(timeoutId);
        alertTimers.delete(serviceId);
      }

      currentLevels.delete(serviceId);
      currentAlerts.delete(serviceId);
      acknowledgedServices.delete(serviceId);

      console.log(`Serviço ${serviceId} marcado como saudável.`);
    }
  }
}
