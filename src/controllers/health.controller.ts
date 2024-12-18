import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../services/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth() {
    const status = await this.healthService.check();
    return {
      timestamp: new Date().toISOString(),
      status: 'ok',
      checks: status
    };
  }
}