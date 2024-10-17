/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INotificationService } from '@application/interfaces/notification-service.interface';
import { ITimerService } from '@application/interfaces/timer-service.interface';
import { HandleAcknowledgementTimeoutUseCase } from '@application/use-cases/handle-acknowledgement-timeout.use-case';
import { ReceiveAlertUseCase } from '@application/use-cases/receive-alert.use-case';
import { Alert } from '@domain/entities/alert';
import { EscalationLevel } from '@domain/entities/escalation-level';
import { EscalationPolicy } from '@domain/entities/escalation-policy';
import { MonitoredService } from '@domain/entities/monitored-service';
import { EmailTarget } from '@domain/entities/targets/email-target';
import { SMSTarget } from '@domain/entities/targets/sms-target';
import { PagerDomainService } from '@domain/services/pager-domain.service';
import { AlertMessage } from '@domain/value-objects/alert-message';
import { EmailAddress } from '@domain/value-objects/email-adress';
import { PhoneNumber } from '@domain/value-objects/phone-number';
import { MockTimerService } from '@test/mocks/mock-timer.service';
import { MockNotificationService } from '@test/mocks/mock-notification.service';

describe('ReceiveAlertUseCase - Scenario 1', () => {
  let receiveAlertUseCase: ReceiveAlertUseCase;
  let pagerDomainService: PagerDomainService;
  let notificationService: MockNotificationService;
  let timerService: MockTimerService;
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiveAlertUseCase,
        PagerDomainService,
        HandleAcknowledgementTimeoutUseCase,
        { provide: INotificationService, useClass: MockNotificationService },
        { provide: ITimerService, useClass: MockTimerService },
      ],
    }).compile();

    receiveAlertUseCase = module.get<ReceiveAlertUseCase>(ReceiveAlertUseCase);
    pagerDomainService = module.get<PagerDomainService>(PagerDomainService);
    notificationService = module.get<INotificationService>(
      INotificationService,
    ) as MockNotificationService;
    timerService = module.get<ITimerService>(ITimerService) as MockTimerService;
    handleAcknowledgementTimeoutUseCase =
      module.get<HandleAcknowledgementTimeoutUseCase>(
        HandleAcknowledgementTimeoutUseCase,
      );
  });

  it('deve processar o alerta corretamente para um serviço saudável', async () => {
    const monitoredServices = new Map<string, MonitoredService>();
    const escalationPolicies = new Map<string, EscalationPolicy>();
    const currentAlerts = new Map<string, Alert>();
    const currentLevels = new Map<string, number>();
    const alertTimers = new Map<string, string>();
    const acknowledgedServices = new Set<string>();

    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId);
    monitoredServices.set(serviceId, monitoredService);

    const escalationPolicy = new EscalationPolicy(serviceId, [
      new EscalationLevel(1, [
        new EmailTarget(new EmailAddress('user1@example.com')),
        new SMSTarget(new PhoneNumber('+1234567890')),
      ]),
    ]);
    escalationPolicies.set(serviceId, escalationPolicy);

    const alert = new Alert(new AlertMessage('Service is down'), serviceId);

    await receiveAlertUseCase.execute(
      alert,
      monitoredServices,
      escalationPolicies,
      currentAlerts,
      currentLevels,
      alertTimers,
      acknowledgedServices,
    );

    // Verificações
    expect(monitoredService.isServiceHealthy()).toBe(false);
    expect(notificationService.notifications).toEqual([
      { method: 'Email', to: 'user1@example.com', message: 'Service is down' },
      { method: 'SMS', to: '+1234567890', message: 'Service is down' },
    ]);
    expect(alertTimers.has(serviceId)).toBe(true);
    expect(timerService.hasTimeout(alertTimers.get(serviceId) as string)).toBe(
      true,
    );
  });
});

describe('ReceiveAlertUseCase - Scenario 4', () => {
  let receiveAlertUseCase: ReceiveAlertUseCase;
  let pagerDomainService: PagerDomainService;
  let notificationService: MockNotificationService;
  let timerService: MockTimerService;
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiveAlertUseCase,
        PagerDomainService,
        HandleAcknowledgementTimeoutUseCase,
        { provide: INotificationService, useClass: MockNotificationService },
        { provide: ITimerService, useClass: MockTimerService },
      ],
    }).compile();

    receiveAlertUseCase = module.get<ReceiveAlertUseCase>(ReceiveAlertUseCase);
    pagerDomainService = module.get<PagerDomainService>(PagerDomainService);
    notificationService = module.get<INotificationService>(
      INotificationService,
    ) as MockNotificationService;
    timerService = module.get<ITimerService>(ITimerService) as MockTimerService;
    handleAcknowledgementTimeoutUseCase =
      module.get<HandleAcknowledgementTimeoutUseCase>(
        HandleAcknowledgementTimeoutUseCase,
      );
  });

  it('não deve processar um alerta para um serviço não saudável', async () => {
    // Dados iniciais
    const monitoredServices = new Map<string, MonitoredService>();
    const escalationPolicies = new Map<string, EscalationPolicy>();
    const currentAlerts = new Map<string, Alert>();
    const currentLevels = new Map<string, number>();
    const alertTimers = new Map<string, string>();
    const acknowledgedServices = new Set<string>();

    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId, false); // Serviço não saudável
    monitoredServices.set(serviceId, monitoredService);

    // Configurar a política de escalonamento (não será usada)
    const escalationPolicy = new EscalationPolicy(serviceId, [
      new EscalationLevel(1, [
        new EmailTarget(new EmailAddress('user1@example.com')),
      ]),
    ]);
    escalationPolicies.set(serviceId, escalationPolicy);

    // Criar o alerta
    const alert = new Alert(
      new AlertMessage('Service is still down'),
      serviceId,
    );

    // Executar o caso de uso
    await receiveAlertUseCase.execute(
      alert,
      monitoredServices,
      escalationPolicies,
      currentAlerts,
      currentLevels,
      alertTimers,
      acknowledgedServices,
    );

    // Verificações
    expect(notificationService.notifications).toEqual([]);
    expect(alertTimers.has(serviceId)).toBe(false);
  });
});
