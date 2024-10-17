/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ReceiveHealthyEventUseCase } from '@application/use-cases/receive-healthy-event.use-case';
import { HandleAcknowledgementTimeoutUseCase } from '@application/use-cases/handle-acknowledgement-timeout.use-case';
import { PagerDomainService } from '@domain/services/pager-domain.service';
import { ITimerService } from '@application/interfaces/timer-service.interface';
import { MockTimerService } from '../mocks/mock-timer.service';
import { MonitoredService } from '@domain/entities/monitored-service';
import { Alert } from '@domain/entities/alert';
import { MockNotificationService } from '@test/mocks/mock-notification.service';
import { INotificationService } from '@application/interfaces/notification-service.interface';

describe('ReceiveHealthyEventUseCase - Scenario 5', () => {
  let receiveHealthyEventUseCase: ReceiveHealthyEventUseCase;
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;
  let pagerDomainService: PagerDomainService;
  let timerService: MockTimerService;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiveHealthyEventUseCase,
        HandleAcknowledgementTimeoutUseCase,
        PagerDomainService,
        { provide: ITimerService, useClass: MockTimerService },
        { provide: INotificationService, useClass: MockNotificationService },
      ],
    }).compile();

    receiveHealthyEventUseCase = module.get<ReceiveHealthyEventUseCase>(
      ReceiveHealthyEventUseCase,
    );
    handleAcknowledgementTimeoutUseCase =
      module.get<HandleAcknowledgementTimeoutUseCase>(
        HandleAcknowledgementTimeoutUseCase,
      );
    pagerDomainService = module.get<PagerDomainService>(PagerDomainService);
    timerService = module.get<ITimerService>(ITimerService) as MockTimerService;
    notificationService = module.get<INotificationService>(
      INotificationService,
    ) as MockNotificationService;
  });

  it('deve marcar o serviço como saudável e não notificar após timeout', async () => {
    // Dados iniciais
    const monitoredServices = new Map<string, MonitoredService>();
    const currentLevels = new Map<string, number>();
    const currentAlerts = new Map<string, Alert>();
    const alertTimers = new Map<string, string>();
    const acknowledgedServices = new Set<string>();

    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId, false); // Serviço não saudável
    monitoredServices.set(serviceId, monitoredService);

    // Configura o temporizador de reconhecimento
    const timeoutId = timerService.setTimeout(() => {}, 15 * 60 * 1000);
    alertTimers.set(serviceId, timeoutId);

    // Recebe evento saudável
    receiveHealthyEventUseCase.execute(
      serviceId,
      monitoredServices,
      currentLevels,
      currentAlerts,
      acknowledgedServices,
      alertTimers,
    );

    // Simula o timeout de reconhecimento
    await handleAcknowledgementTimeoutUseCase.execute(
      serviceId,
      monitoredServices,
      new Map(),
      currentAlerts,
      currentLevels,
      alertTimers,
      acknowledgedServices,
    );

    // Verificações
    expect(monitoredService.isServiceHealthy()).toBe(true);
    expect(notificationService.notifications).toEqual([]);
    expect(alertTimers.has(serviceId)).toBe(false);
  });
});
