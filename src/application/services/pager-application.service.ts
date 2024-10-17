import { INotificationService } from '@application/interfaces/notification-service.interface';
import { ITimerService } from '@application/interfaces/timer-service.interface';
import { AcknowledgeAlertUseCase } from '@application/use-cases/acknowledge-alert.use-case';
import { HandleAcknowledgementTimeoutUseCase } from '@application/use-cases/handle-acknowledgement-timeout.use-case';
import { ReceiveAlertUseCase } from '@application/use-cases/receive-alert.use-case';
import { ReceiveHealthyEventUseCase } from '@application/use-cases/receive-healthy-event.use-case';
import { Alert } from '@domain/entities/alert';
import { EscalationPolicy } from '@domain/entities/escalation-policy';
import { MonitoredService } from '@domain/entities/monitored-service';
import { PagerDomainService } from '@domain/services/pager-domain.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PagerApplicationService {
  private monitoredServices: Map<string, MonitoredService> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private alertTimers: Map<string, string> = new Map();
  private currentLevels: Map<string, number> = new Map();
  private currentAlerts: Map<string, Alert> = new Map();
  private acknowledgedServices: Set<string> = new Set();

  constructor(
    private readonly receiveAlertUseCase: ReceiveAlertUseCase,
    private readonly acknowledgeAlertUseCase: AcknowledgeAlertUseCase,
    private readonly receiveHealthyEventUseCase: ReceiveHealthyEventUseCase,
    private readonly handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase,
    private readonly notificationService: INotificationService,
    private readonly timerService: ITimerService,
    private readonly pagerDomainService: PagerDomainService,
  ) {}

  async receiveAlert(alert: Alert): Promise<void> {
    await this.receiveAlertUseCase.execute(
      alert,
      this.monitoredServices,
      this.escalationPolicies,
      this.currentAlerts,
      this.currentLevels,
      this.alertTimers,
      this.acknowledgedServices,
    );
  }

  acknowledgeAlert(serviceId: string): void {
    this.acknowledgeAlertUseCase.execute(
      serviceId,
      this.monitoredServices,
      this.acknowledgedServices,
      this.alertTimers,
      this.currentAlerts,
    );
  }

  receiveHealthyEvent(serviceId: string): void {
    this.receiveHealthyEventUseCase.execute(
      serviceId,
      this.monitoredServices,
      this.currentLevels,
      this.currentAlerts,
      this.acknowledgedServices,
      this.alertTimers,
    );
  }

  handleAcknowledgementTimeout(serviceId: string): void {
    this.handleAcknowledgementTimeoutUseCase.execute(
      serviceId,
      this.monitoredServices,
      this.escalationPolicies,
      this.currentAlerts,
      this.currentLevels,
      this.alertTimers,
      this.acknowledgedServices,
    );
  }

  setEscalationPolicy(serviceId: string, policy: EscalationPolicy): void {
    this.escalationPolicies.set(serviceId, policy);
  }
}
