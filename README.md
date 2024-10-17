# PagerApplicationService Project Documentation

## Overview

The `PagerApplicationService` project is a service designed to handle alert notifications, acknowledgments, and healthy events for monitored services. The system aims to ensure that alerts are managed and escalated appropriately according to defined escalation policies. This documentation provides an overview of the architecture, core components, and testing of the service.

The project implements Domain-Driven Design (DDD) principles to create a well-structured and scalable architecture. It uses NestJS, a progressive Node.js framework, along with various supporting modules and services to handle different aspects of the alert management process.

## Architecture

The `PagerApplicationService` project follows a modular architecture that separates the core domain logic from infrastructure concerns. It consists of the following key components:

- **Domain Layer**: Represents the core business logic, including entities, value objects, and domain services.
- **Application Layer**: Contains use cases that define application-specific business rules. It also includes application services that coordinate use case execution.
- **Infrastructure Layer**: Handles communication with external services, such as notification systems and timer management.

The service uses RabbitMQ for messaging, which facilitates asynchronous communication between components, making it suitable for handling real-time alerts and notifications.

### Key Components

- **Entities**: Represent core business objects, such as `Alert`, `MonitoredService`, `EscalationPolicy`, and `Target`.
- **Value Objects**: Encapsulate data and behavior related to specific concepts, such as `AlertMessage` and `EmailAddress`.
- **Use Cases**: The main operations that the system can perform, such as `ReceiveAlertUseCase`, `AcknowledgeAlertUseCase`, `ReceiveHealthyEventUseCase`, and `HandleAcknowledgementTimeoutUseCase`.
- **Notification Service**: Responsible for sending notifications to targets via email or other channels.
- **Timer Service**: Manages acknowledgment timeouts to escalate alerts when necessary.

## Application Services

The `PagerApplicationService` class is the main entry point for managing alerts and monitored services. It provides methods to receive alerts, acknowledge alerts, and handle healthy events. The application service coordinates the interactions between the domain and the infrastructure layers.

### Core Methods of `PagerApplicationService`

- **`receiveAlert(alert: Alert)`**: Handles receiving a new alert. It delegates the alert handling to `ReceiveAlertUseCase`, which determines how to proceed based on the escalation policy of the monitored service.
- **`acknowledgeAlert(serviceId: string)`**: Allows a target to acknowledge an alert. It invokes `AcknowledgeAlertUseCase` to ensure that the acknowledgment is processed correctly, stopping further escalation.
- **`receiveHealthyEvent(serviceId: string)`**: Marks a monitored service as healthy. It calls `ReceiveHealthyEventUseCase` to reset the alert state and stop any ongoing notifications or escalations.
- **Private Method - `handleAcknowledgementTimeout(serviceId: string)`**: This method is called internally to handle situations where an alert acknowledgment times out, invoking `HandleAcknowledgementTimeoutUseCase` to escalate the alert to the next level.

## Domain Entities

- **`Alert`**: Represents an alert triggered by a monitored service. Contains information such as the service identifier and the alert message.
- **`MonitoredService`**: Represents a service that is being monitored for potential issues. It maintains the current state (healthy or unhealthy) of the service.
- **`EscalationPolicy`**: Defines the levels of escalation and the targets to be notified at each level. Each level contains a set of `Targets` (either email or SMS).
- **`Target`**: Represents a notification target, such as an email address or phone number.

## Value Objects

- **`AlertMessage`**: Encapsulates the message content of an alert.
- **`EmailAddress`**: Represents an email address used for notifications, including validation logic.

## Use Cases

The use cases represent the core functionalities that the system performs:

- **`ReceiveAlertUseCase`**: Handles incoming alerts and determines the appropriate escalation actions based on the escalation policy of the monitored service.
- **`AcknowledgeAlertUseCase`**: Processes the acknowledgment of an alert, ensuring that no further escalation occurs once an alert is acknowledged.
- **`ReceiveHealthyEventUseCase`**: Marks a monitored service as healthy, resetting any active alerts and stopping ongoing escalations.
- **`HandleAcknowledgementTimeoutUseCase`**: Handles the timeout event for an alert acknowledgment. If an alert is not acknowledged within the defined time, this use case escalates the alert to the next level.

## Infrastructure Services

- **Notification Service (`INotificationService`)**: This service is responsible for sending notifications to the designated targets. The implementation can be adapted to different channels such as email, SMS, or push notifications.
- **Timer Service (`ITimerService`)**: Manages the setting, clearing, and triggering of timers related to alert acknowledgment. This allows the system to escalate alerts if no acknowledgment is received within a specified period.

## Testing

### Overview

The project includes comprehensive unit tests to validate the behavior of the `PagerApplicationService`. The test suite ensures that the service behaves as expected in different scenarios, such as receiving alerts, handling acknowledgment timeouts, acknowledging alerts, and processing healthy events.

### Dependencies

The following dependencies are used for testing:

- **Jest**: A JavaScript testing framework used for writing and running tests.
- **NestJS Testing Module**: Provides an isolated testing environment for the service.
- **Mock Services**: Mock implementations are used to simulate external dependencies like `NotificationService` and `TimerService`.

### Test Suite Setup

Before each test, the `TestingModule` is created to provide instances of the `PagerApplicationService` and its dependencies. Mocks are used for external services to simulate behavior without side effects. The `jest.spyOn()` function is used to spy on the `execute` methods of all use cases to verify their invocation.

### Test Cases

The test suite includes the following cases:

1. **Handling an Acknowledgment Timeout**: Verifies that the system escalates alerts correctly when an acknowledgment timeout occurs.
2. **Receiving an Alert and Setting the Service to Unhealthy**: Verifies that receiving an alert sets the monitored service to an unhealthy state and that the appropriate actions are taken.
3. **Acknowledging an Alert**: Verifies that acknowledging an alert stops further escalation and notifications.
4. **Handling a Healthy Event**: Verifies that receiving a healthy event resets the service's alert state and stops any ongoing escalations.

### Example Test Case

```typescript
it('should handle an acknowledgement timeout correctly', async () => {
  const serviceId = 'service-1';
  const monitoredService = new MonitoredService(serviceId);
  const alert = new Alert(new AlertMessage('Service is down'), serviceId);
  const escalationPolicy = new EscalationPolicy(serviceId, [
    new EscalationLevel(1, [new EmailTarget(new EmailAddress('user@example.com'))]),
  ]);

  service.setEscalationPolicy(serviceId, escalationPolicy);

  // Simulate receiving an alert and setting up a timeout
  await service.receiveAlert(alert);

  // Manually trigger the timeout event
  const timeoutId = `timeout-1`; // Adjust according to the ID logic in MockTimerService
  if (timerService.hasTimeout(timeoutId)) {
    timerService.triggerTimeout(timeoutId);
  }

  // Verify if the timeout use case was executed
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
```

## Summary

The `PagerApplicationService` project is designed to provide an efficient way to manage alerts, acknowledgments, and service health in a monitored system. It follows Domain-Driven Design principles and uses a modular architecture to separate core business logic from infrastructure concerns.

### Key Features

- **Domain-Driven Design (DDD)**: Ensures a clear separation between business logic and infrastructure.
- **Escalation Policies**: Allows for flexible alert escalation strategies based on service needs.
- **Comprehensive Testing**: Includes detailed unit tests to verify the correct behavior of core functionalities.

### Dependencies

- **NestJS**: A framework for building scalable server-side applications.
- **Jest**: For unit testing.
- **MockTimerService** and **MockNotificationService**: Provide mock implementations for testing without real-world side effects.

This documentation provides an overview of the architecture, core components, use cases, infrastructure services, and testing strategy used in the `PagerApplicationService` project. The project aims to create a scalable, maintainable, and well-tested alert management system.
