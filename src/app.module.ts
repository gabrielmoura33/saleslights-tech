import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PagerApplicationService } from './application/services/pager-application.service';
import { ReceiveAlertUseCase } from './application/use-cases/receive-alert.use-case';
import { AcknowledgeAlertUseCase } from './application/use-cases/acknowledge-alert.use-case';
import { ReceiveHealthyEventUseCase } from './application/use-cases/receive-healthy-event.use-case';
import { INotificationService } from './application/interfaces/notification-service.interface';
import { MockNotificationService } from './infra/services/mock-notification.service';
import { ITimerService } from './application/interfaces/timer-service.interface';
import { NestJSTimerService } from './infra/services/nestjs-timer.service';
import { PagerDomainService } from './domain/services/pager-domain.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PagerApplicationService,
    ReceiveAlertUseCase,
    AcknowledgeAlertUseCase,
    ReceiveHealthyEventUseCase,
    PagerDomainService,
    { provide: INotificationService, useClass: MockNotificationService },
    { provide: ITimerService, useClass: NestJSTimerService },
  ],
})
export class AppModule {}
