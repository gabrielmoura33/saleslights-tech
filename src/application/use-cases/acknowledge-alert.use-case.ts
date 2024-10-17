import { Injectable } from '@nestjs/common';
import { MonitoredService } from '../../domain/entities/monitored-service';
import { PagerDomainService } from '../../domain/services/pager-domain.service';
import { ITimerService } from '../interfaces/timer-service.interface';
import { INotificationService } from '../interfaces/notification-service.interface';
import { ServiceNotFoundError } from '../errors/service-not-found.error';
import { AlertAlreadyAcknowledgedError } from '../errors/alert-already-acknowledged.error';
import { CannotAcknowledgeHealthyServiceError } from '../errors/cannot-acknowledge-healthy-service.error';
import { AlertNotFoundError } from '../errors/alert-not-found.error';
import { Alert } from '../../domain/entities/alert';

@Injectable()
export class AcknowledgeAlertUseCase {
  constructor(
    private readonly pagerDomainService: PagerDomainService,
    private readonly timerService: ITimerService,
    private readonly notificationService: INotificationService,
  ) {}

  execute(
    serviceId: string,
    monitoredServices: Map<string, MonitoredService>,
    acknowledgedServices: Set<string>,
    alertTimers: Map<string, string>,
    currentAlerts: Map<string, Alert>,
  ): void {
    const monitoredService = monitoredServices.get(serviceId);
    if (!monitoredService) {
      throw new ServiceNotFoundError(serviceId);
    }

    const alert = currentAlerts.get(serviceId);
    if (!alert) {
      throw new AlertNotFoundError(serviceId);
    }

    if (this.pagerDomainService.canAcknowledgeAlert(monitoredService)) {
      if (acknowledgedServices.has(serviceId)) {
        throw new AlertAlreadyAcknowledgedError(serviceId);
      }

      acknowledgedServices.add(serviceId);

      // Limpar timeout
      const timeoutId = alertTimers.get(serviceId);
      if (timeoutId) {
        this.timerService.clearTimeout(timeoutId);
        alertTimers.delete(serviceId);
      }

      console.log(`Alerta reconhecido para o serviço ${serviceId}.`);
    } else {
      throw new CannotAcknowledgeHealthyServiceError(serviceId);
    }
  }
}
