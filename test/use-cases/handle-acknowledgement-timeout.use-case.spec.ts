/* eslint-disable @typescript-eslint/no-unused-vars */
import { INotificationService } from '@application/interfaces/notification-service.interface';
import { ITimerService } from '@application/interfaces/timer-service.interface';
import { HandleAcknowledgementTimeoutUseCase } from '@application/use-cases/handle-acknowledgement-timeout.use-case';
import { Alert } from '@domain/entities/alert';
import { EscalationLevel } from '@domain/entities/escalation-level';
import { EscalationPolicy } from '@domain/entities/escalation-policy';
import { MonitoredService } from '@domain/entities/monitored-service';
import { EmailTarget } from '@domain/entities/targets/email-target';
import { PagerDomainService } from '@domain/services/pager-domain.service';
import { AlertMessage } from '@domain/value-objects/alert-message';
import { EmailAddress } from '@domain/value-objects/email-adress';
import { MockNotificationService } from '@test/mocks/mock-notification.service';
import { TestingModule, Test } from '@nestjs/testing';
import { MockTimerService } from '@test/mocks/mock-timer.service';

describe('HandleAcknowledgementTimeoutUseCase - Scenario 2', () => {
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;
  let pagerDomainService: PagerDomainService;
  let notificationService: MockNotificationService;
  let timerService: MockTimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleAcknowledgementTimeoutUseCase,
        PagerDomainService,
        { provide: INotificationService, useClass: MockNotificationService },
        { provide: ITimerService, useClass: MockTimerService },
      ],
    }).compile();

    handleAcknowledgementTimeoutUseCase =
      module.get<HandleAcknowledgementTimeoutUseCase>(
        HandleAcknowledgementTimeoutUseCase,
      );
    pagerDomainService = module.get<PagerDomainService>(PagerDomainService);
    notificationService = module.get<INotificationService>(
      INotificationService,
    ) as MockNotificationService;
    timerService = module.get<ITimerService>(ITimerService) as MockTimerService;
  });

  it('deve notificar o próximo nível após o timeout de reconhecimento', async () => {
    const monitoredServices = new Map<string, MonitoredService>();
    const escalationPolicies = new Map<string, EscalationPolicy>();
    const currentAlerts = new Map<string, Alert>();
    const currentLevels = new Map<string, number>();
    const alertTimers = new Map<string, string>();
    const acknowledgedServices = new Set<string>();

    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId, false);
    monitoredServices.set(serviceId, monitoredService);

    const escalationPolicy = new EscalationPolicy(serviceId, [
      new EscalationLevel(1, [
        new EmailTarget(new EmailAddress('level1@example.com')),
      ]),
      new EscalationLevel(2, [
        new EmailTarget(new EmailAddress('level2@example.com')),
      ]),
    ]);
    escalationPolicies.set(serviceId, escalationPolicy);

    // Definir nível atual como 1
    currentLevels.set(serviceId, 1);

    // Criar alerta atual
    const alert = new Alert(new AlertMessage('Service is down'), serviceId);
    currentAlerts.set(serviceId, alert);

    // Executar o caso de uso (simulando o timeout de reconhecimento)
    await handleAcknowledgementTimeoutUseCase.execute(
      serviceId,
      monitoredServices,
      escalationPolicies,
      currentAlerts,
      currentLevels,
      alertTimers,
      acknowledgedServices,
    );

    // Verificações
    expect(currentLevels.get(serviceId)).toBe(2);
    expect(notificationService.notifications).toEqual([
      { method: 'Email', to: 'level2@example.com', message: 'Service is down' },
    ]);
    expect(alertTimers.has(serviceId)).toBe(true);
    expect(timerService.hasTimeout(alertTimers.get(serviceId) as string)).toBe(
      true,
    );
  });
});
