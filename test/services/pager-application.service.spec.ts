/* eslint-disable @typescript-eslint/no-unused-vars */
// test/services/pager-application.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PagerApplicationService } from '../../src/application/services/pager-application.service';
import { ReceiveAlertUseCase } from '../../src/application/use-cases/receive-alert.use-case';
import { AcknowledgeAlertUseCase } from '../../src/application/use-cases/acknowledge-alert.use-case';
import { ReceiveHealthyEventUseCase } from '../../src/application/use-cases/receive-healthy-event.use-case';
import { HandleAcknowledgementTimeoutUseCase } from '../../src/application/use-cases/handle-acknowledgement-timeout.use-case';
import { INotificationService } from '../../src/application/interfaces/notification-service.interface';
import { ITimerService } from '../../src/application/interfaces/timer-service.interface';
import { MockNotificationService } from '../mocks/mock-notification.service';
import { MockTimerService } from '../mocks/mock-timer.service';
import { PagerDomainService } from '../../src/domain/services/pager-domain.service';
import { MonitoredService } from '../../src/domain/entities/monitored-service';
import { Alert } from '../../src/domain/entities/alert';
import { AlertMessage } from '../../src/domain/value-objects/alert-message';
import { EscalationPolicy } from '../../src/domain/entities/escalation-policy';
import { EscalationLevel } from '../../src/domain/entities/escalation-level';
import { EmailTarget } from '../../src/domain/entities/targets/email-target';
import { EmailAddress } from '../../src/domain/value-objects/email-adress';

describe('PagerApplicationService', () => {
  let service: PagerApplicationService;
  let receiveAlertUseCase: ReceiveAlertUseCase;
  let acknowledgeAlertUseCase: AcknowledgeAlertUseCase;
  let receiveHealthyEventUseCase: ReceiveHealthyEventUseCase;
  let handleAcknowledgementTimeoutUseCase: HandleAcknowledgementTimeoutUseCase;
  let timerService: MockTimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagerApplicationService,
        ReceiveAlertUseCase,
        AcknowledgeAlertUseCase,
        ReceiveHealthyEventUseCase,
        HandleAcknowledgementTimeoutUseCase,
        PagerDomainService,
        { provide: INotificationService, useClass: MockNotificationService },
        { provide: ITimerService, useClass: MockTimerService },
      ],
    }).compile();

    service = module.get<PagerApplicationService>(PagerApplicationService);
    receiveAlertUseCase = module.get<ReceiveAlertUseCase>(ReceiveAlertUseCase);
    acknowledgeAlertUseCase = module.get<AcknowledgeAlertUseCase>(
      AcknowledgeAlertUseCase,
    );
    receiveHealthyEventUseCase = module.get<ReceiveHealthyEventUseCase>(
      ReceiveHealthyEventUseCase,
    );
    handleAcknowledgementTimeoutUseCase =
      module.get<HandleAcknowledgementTimeoutUseCase>(
        HandleAcknowledgementTimeoutUseCase,
      );
    timerService = module.get<ITimerService>(ITimerService) as MockTimerService;

    jest.spyOn(handleAcknowledgementTimeoutUseCase, 'execute');
    jest.spyOn(acknowledgeAlertUseCase, 'execute');
    jest.spyOn(receiveAlertUseCase, 'execute');
    jest.spyOn(receiveHealthyEventUseCase, 'execute');
  });

  it('should handle an acknowledgement timeout correctly', async () => {
    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId);
    const alert = new Alert(new AlertMessage('Service is down'), serviceId);
    const escalationPolicy = new EscalationPolicy(serviceId, [
      new EscalationLevel(1, [
        new EmailTarget(new EmailAddress('user@example.com')),
      ]),
    ]);

    service.setEscalationPolicy(serviceId, escalationPolicy);

    await service.receiveAlert(alert);

    const timeoutId = `timeout-1`;
    if (timerService.hasTimeout(timeoutId)) {
      timerService.triggerTimeout(timeoutId);
    }

    expect(handleAcknowledgementTimeoutUseCase.execute).toHaveBeenCalledWith(
      serviceId,
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Set),
    );
  });
  it('should receive an alert and set the service to unhealthy', async () => {
    const serviceId = 'service-1';
    const monitoredService = new MonitoredService(serviceId);
    const alert = new Alert(new AlertMessage('Service is down'), serviceId);
    const escalationPolicy = new EscalationPolicy(serviceId, [
      new EscalationLevel(1, [
        new EmailTarget(new EmailAddress('user@example.com')),
      ]),
    ]);

    service.setEscalationPolicy(serviceId, escalationPolicy);

    await service.receiveAlert(alert);

    expect(receiveAlertUseCase.execute).toHaveBeenCalledWith(
      alert,
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Set),
    );
  });

  it('should handle a healthy event', () => {
    const serviceId = 'service-1';
    service.receiveHealthyEvent(serviceId);

    expect(receiveHealthyEventUseCase.execute).toHaveBeenCalledWith(
      serviceId,
      expect.any(Map),
      expect.any(Map),
      expect.any(Map),
      expect.any(Set),
      expect.any(Map),
    );
  });
});
