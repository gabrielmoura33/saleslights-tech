import { Injectable } from '@nestjs/common';
import { MonitoredService } from '../../domain/entities/monitored-service';
import { Alert } from '../../domain/entities/alert';
import { EscalationPolicy } from '../../domain/entities/escalation-policy';
import { INotificationService } from '../interfaces/notification-service.interface';
import { ITimerService } from '../interfaces/timer-service.interface';
import { PagerDomainService } from '../../domain/services/pager-domain.service';
import { AlertNotFoundError } from '@application/errors/alert-not-found.error';

@Injectable()
export class PagerApplicationService {
  private monitoredServices: Map<string, MonitoredService> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private alertTimers: Map<string, string> = new Map();
  private currentLevels: Map<string, number> = new Map();
  private currentAlerts: Map<string, Alert> = new Map();
  private acknowledgedServices: Set<string> = new Set();

  private pagerDomainService = new PagerDomainService();

  constructor(
    private notificationService: INotificationService,
    private timerService: ITimerService,
  ) {}

  receiveAlert(alert: Alert) {
    const serviceId = alert.getServiceId();
    let monitoredService = this.monitoredServices.get(serviceId);

    if (!monitoredService) {
      monitoredService = new MonitoredService(serviceId);
      this.monitoredServices.set(serviceId, monitoredService);
    }

    if (this.pagerDomainService.shouldProcessAlert(monitoredService)) {
      this.pagerDomainService.markServiceUnhealthy(monitoredService);
      this.currentAlerts.set(serviceId, alert);
      const initialLevel = 1;
      this.currentLevels.set(serviceId, initialLevel);
      this.notifyTargets(serviceId, initialLevel);
      this.setAcknowledgementTimeout(serviceId);
    } else {
      console.log(
        `Alerta recebido para o serviço ${serviceId}, mas ele já está não saudável.`,
      );
    }
  }

  private notifyTargets(serviceId: string, level: number) {
    const escalationPolicy = this.escalationPolicies.get(serviceId);
    if (!escalationPolicy) return;

    const targets = this.pagerDomainService.getTargetsForLevel(
      escalationPolicy,
      level,
    );
    const alert = this.currentAlerts.get(serviceId);

    if (!alert) {
      throw new AlertNotFoundError(serviceId);
    }

    targets.forEach((target) => {
      const contactInfo = target.getContactInfo();
      const notificationMethod = target.getNotificationMethod();

      if (notificationMethod === 'Email') {
        this.notificationService.sendEmail(
          contactInfo,
          'Alert Notification',
          alert.getMessage().toString(),
        );
      } else if (notificationMethod === 'SMS') {
        this.notificationService.sendSMS(
          contactInfo,
          alert.getMessage().toString(),
        );
      }
    });

    console.log(
      `Alvos do nível ${level} notificados para o serviço ${serviceId}.`,
    );
  }

  acknowledgeAlert(serviceId: string) {
    const monitoredService = this.monitoredServices.get(serviceId);
    if (
      monitoredService &&
      this.pagerDomainService.canAcknowledgeAlert(monitoredService)
    ) {
      this.acknowledgedServices.add(serviceId);
      this.clearAcknowledgementTimeout(serviceId);
      console.log(`Alerta reconhecido para o serviço ${serviceId}.`);
    } else {
      console.log(
        `Não é possível reconhecer o alerta para o serviço ${serviceId}.`,
      );
    }
  }

  receiveHealthyEvent(serviceId: string) {
    const monitoredService = this.monitoredServices.get(serviceId);
    if (monitoredService) {
      this.pagerDomainService.markServiceHealthy(monitoredService);
      this.clearAcknowledgementTimeout(serviceId);
      this.currentLevels.delete(serviceId);
      this.currentAlerts.delete(serviceId);
      this.acknowledgedServices.delete(serviceId);
      console.log(`Serviço ${serviceId} marcado como saudável.`);
    }
  }

  private handleAcknowledgementTimeout(serviceId: string) {
    if (this.acknowledgedServices.has(serviceId)) {
      console.log(`Alerta para o serviço ${serviceId} já foi reconhecido.`);
      return;
    }

    const currentLevel = this.currentLevels.get(serviceId);
    const escalationPolicy = this.escalationPolicies.get(serviceId);

    if (currentLevel && escalationPolicy) {
      if (
        this.pagerDomainService.hasMoreLevels(escalationPolicy, currentLevel)
      ) {
        const nextLevel = this.pagerDomainService.getNextLevel(currentLevel);
        this.currentLevels.set(serviceId, nextLevel);
        this.notifyTargets(serviceId, nextLevel);
        this.setAcknowledgementTimeout(serviceId);
      } else {
        console.log(`Último nível já notificado para o serviço ${serviceId}.`);
      }
    }
  }

  private setAcknowledgementTimeout(serviceId: string) {
    this.clearAcknowledgementTimeout(serviceId);

    const timeout = 15 * 60 * 1000; // 15 minutes
    const timeoutId = this.timerService.setTimeout(() => {
      this.handleAcknowledgementTimeout(serviceId);
    }, timeout);

    this.alertTimers.set(serviceId, timeoutId);
    console.log(
      `Timer de reconhecimento configurado para o serviço ${serviceId}.`,
    );
  }

  private clearAcknowledgementTimeout(serviceId: string) {
    const timeoutId = this.alertTimers.get(serviceId);
    if (timeoutId) {
      this.timerService.clearTimeout(timeoutId);
      this.alertTimers.delete(serviceId);
      console.log(`Timer de reconhecimento limpo para o serviço ${serviceId}.`);
    }
  }

  setEscalationPolicy(serviceId: string, policy: EscalationPolicy) {
    this.escalationPolicies.set(serviceId, policy);
  }
}
