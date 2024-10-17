/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AcknowledgeAlertUseCase } from '../../src/application/use-cases/acknowledge-alert.use-case';
import { HandleAcknowledgementTimeoutUseCase } from '../../src/application/use-cases/handle-acknowledgement-timeout.use-case';
import { PagerDomainService } from '../../src/domain/services/pager-domain.service';
import { ITimerService } from '../../src/application/interfaces/timer-service.interface';
import { INotificationService } from '../../src/application/interfaces/notification-service.interface';
import { MockTimerService } from '../mocks/mock-timer.service';
import { MockNotificationService } from '../mocks/mock-notification.service';
import { MonitoredService } from '../../src/domain/entities/monitored-service';
import { Alert } from '../../src/domain/entities/alert';
import { AlertMessage } from '../../src/domain/value-objects/alert-message';

describe('AcknowledgeAlertUseCase - Scenario 3', () => {
  let acknowledgeAlertUseCase: AcknowledgeAlertUseCase;
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;
  let pagerDomainService: PagerDomainService;
  let timerService: MockTimerService;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcknowledgeAlertUseCase,
        HandleAcknowledgementTimeoutUseCase,
        PagerDomainService,
        { provide: ITimerService, useClass: MockTimerService },
        { provide: INotificationService, useClass: MockNotificationService },
      ],
    }).compile();

    acknowledgeAlertUseCase = module.get<AcknowledgeAlertUseCase>(
      AcknowledgeAlertUseCase,
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

  it('não deve notificar alvos após reconhecimento e timeout subsequente', async () => {
    // Dados iniciais
    const monitoredServices = new Map<string, MonitoredService>();
    const currentLevels = new Map<string, number>();
    const currentAlerts = new Map<string, Alert>();
    const alertTimers = new Map<string, string>();
    const acknowledgedServices = new Set<string>();

    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId, false); // Serviço não saudável
    monitoredServices.set(serviceId, monitoredService);

    // Criar alerta atual
    const alert = new Alert(new AlertMessage('Service is down'), serviceId);
    currentAlerts.set(serviceId, alert);

    // Configurar temporizador de reconhecimento
    const timeoutId = timerService.setTimeout(() => {}, 15 * 60 * 1000);
    alertTimers.set(serviceId, timeoutId);

    // Executar o reconhecimento
    acknowledgeAlertUseCase.execute(
      serviceId,
      monitoredServices,
      acknowledgedServices,
      alertTimers,
      currentAlerts,
    );

    // Simular o timeout de reconhecimento
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
    expect(notificationService.notifications).toEqual([]);
    expect(alertTimers.has(serviceId)).toBe(false);
  });
});
