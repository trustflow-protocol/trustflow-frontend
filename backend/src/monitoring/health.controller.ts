import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';

@Controller()
export class HealthController {
  constructor(private health: HealthService, private metrics: MetricsService) {}

  @Get('health')
  async getHealth() { return this.health.check(); }

  @Get('metrics')
  getMetrics() { return this.metrics.toPrometheus(); }
}
