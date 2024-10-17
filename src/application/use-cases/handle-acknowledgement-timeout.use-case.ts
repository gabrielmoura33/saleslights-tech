import { Injectable } from '@nestjs/common';
import { Alert } from '@domain/entities/alert';
import { EscalationPolicy } from '@domain/entities/escalation-policy';
import { MonitoredService } from '@domain/entities/monitored-service';
import { PagerDomainService } from '@domain/services/pager-domain.service';
import { ServiceNotFoundError } from '../errors/service-not-found.error';
import { INotificationService } from '../interfaces/notification-service.interface';
import { ITimerService } from '../interfaces/timer-service.interface';

@Injectable()
export class HandleAcknowledgementTimeoutUseCase {
  constructor(
    private readonly pagerDomainService: PagerDomainService,
    private readonly notificationService: INotificationService,
    private readonly timerService: ITimerService,
  ) {}

  async execute(
    serviceId: string,
    monitoredServices: Map<string, MonitoredService>,
    escalationPolicies: Map<string, EscalationPolicy>,
    currentAlerts: Map<string, Alert>,
    currentLevels: Map<string, number>,
    alertTimers: Map<string, string>,
    acknowledgedServices: Set<string>,
  ): Promise<void> {
    const monitoredService = monitoredServices.get(serviceId);
    if (!monitoredService) {
      throw new ServiceNotFoundError(serviceId);
    }

    const currentLevel = currentLevels.get(serviceId);
    const escalationPolicy = escalationPolicies.get(serviceId);

    if (!currentLevel || !escalationPolicy) {
      console.log(
        `Nenhum nível ou política de escalonamento configurada para o serviço ${serviceId}.`,
      );
      return;
    }

    // Verificar se há mais níveis para escalar
    if (this.pagerDomainService.hasMoreLevels(escalationPolicy, currentLevel)) {
      const nextLevel = this.pagerDomainService.getNextLevel(currentLevel);
      currentLevels.set(serviceId, nextLevel);

      const targets = this.pagerDomainService.getTargetsForLevel(
        escalationPolicy,
        nextLevel,
      );
      const alert = currentAlerts.get(serviceId);

      if (alert) {
        for (const target of targets) {
          await this.notificationService.sendNotification(target, alert);
        }
      }

      // Configurar novo timeout para o próximo nível
      const newTimeoutId = this.timerService.setTimeout(
        () => {
          this.execute(
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
      );

      // Atualizar o ID do timeout no mapa de alertTimers
      const oldTimeoutId = alertTimers.get(serviceId);
      if (oldTimeoutId) {
        this.timerService.clearTimeout(oldTimeoutId);
      }
      alertTimers.set(serviceId, newTimeoutId);

      console.log(
        `Alerta escalado para o próximo nível (${nextLevel}) para o serviço ${serviceId}.`,
      );
    } else {
      console.log(
        `Último nível já foi notificado para o serviço ${serviceId}.`,
      );
    }
  }
}
