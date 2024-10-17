export class MonitoredService {
  private readonly id: string;
  private isHealthy: boolean;

  constructor(id: string, isHealthy: boolean = true) {
    this.id = id;
    this.isHealthy = isHealthy;
  }

  getId(): string {
    return this.id;
  }

  isServiceHealthy(): boolean {
    return this.isHealthy;
  }

  markUnhealthy() {
    this.isHealthy = false;
  }

  markHealthy() {
    this.isHealthy = true;
  }
}
