import { Injectable } from '@nestjs/common';
import { MonitoredService } from '../../domain/entities/monitored-service';
import { Alert } from '../../domain/entities/alert';
import { EscalationPolicy } from '../../domain/entities/escalation-policy';
import { PagerDomainService } from '../../domain/services/pager-domain.service';
import { INotificationService } from '../interfaces/notification-service.interface';
import { ITimerService } from '../interfaces/timer-service.interface';
import { HandleAcknowledgementTimeoutUseCase } from './handle-acknowledgement-timeout.use-case';
import { ServiceNotFoundError } from '../errors/service-not-found.error';

@Injectable()
export class ReceiveAlertUseCase {
  constructor(
    private readonly pagerDomainService: PagerDomainService,
    private readonly notificationService: INotificationService,
    private readonly timerService: ITimerService,
    private readonly handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase,
  ) {}

  async execute(
    alert: Alert,
    monitoredServices: Map<string, MonitoredService>,
    escalationPolicies: Map<string, EscalationPolicy>,
    currentAlerts: Map<string, Alert>,
    currentLevels: Map<string, number>,
    alertTimers: Map<string, string>,
    acknowledgedServices: Set<string>,
  ): Promise<void> {
    const serviceId = alert.getServiceId();
    let monitoredService = monitoredServices.get(serviceId);

    // Se o serviço não estiver monitorado, criar uma nova instância
    if (!monitoredService) {
      monitoredService = new MonitoredService(serviceId);
      monitoredServices.set(serviceId, monitoredService);
    }

    // Verifica se o alerta deve ser processado (o serviço precisa estar saudável)
    if (this.pagerDomainService.shouldProcessAlert(monitoredService)) {
      this.pagerDomainService.markServiceUnhealthy(monitoredService);
      currentAlerts.set(serviceId, alert);
      const initialLevel = 1;
      currentLevels.set(serviceId, initialLevel);

      // Obter a política de escalonamento para o serviço
      const escalationPolicy = escalationPolicies.get(serviceId);
      if (!escalationPolicy) {
        throw new ServiceNotFoundError(serviceId);
      }

      // Notificar os alvos do primeiro nível
      const targets = this.pagerDomainService.getTargetsForLevel(
        escalationPolicy,
        initialLevel,
      );
      for (const target of targets) {
        await this.notificationService.sendNotification(target, alert);
      }

      // Configurar o timeout de reconhecimento para o primeiro nível
      const timeoutId = this.timerService.setTimeout(
        () => {
          this.handleAcknowledgementTimeoutUseCase.execute(
            serviceId,
            monitoredServices,
            escalationPolicies,
            currentAlerts,
            currentLevels,
            alertTimers,
            acknowledgedServices,
          );
        },
        15 * 60 * 1000,
      ); // Timeout de 15 minutos

      // Armazenar o ID do timeout no mapa
      const oldTimeoutId = alertTimers.get(serviceId);
      if (oldTimeoutId) {
        this.timerService.clearTimeout(oldTimeoutId);
      }
      alertTimers.set(serviceId, timeoutId);

      console.log(
        `Alerta processado para o serviço ${serviceId}, nível inicial: ${initialLevel}.`,
      );
    } else {
      console.log(
        `Alerta ignorado para o serviço ${serviceId} (já não saudável).`,
      );
    }
  }
}
