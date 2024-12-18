import { Injectable } from '@nestjs/common';
import { SupabaseConfig } from '../config/supabase.config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthService {
  constructor(
    private supabaseConfig: SupabaseConfig,
    private httpService: HttpService,
  ) {}

  async check() {
    const dbStatus = await this.checkDatabase();
    return {
      database: dbStatus ? 'healthy' : 'unhealthy',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Simple query to check database connectivity
      const { data, error } = await this.supabaseConfig
        .getClient()
        .from('categories')
        .select('count', { count: 'exact', head: true });
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async dailyHealthCheck() {
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
      await firstValueFrom(
        this.httpService.get(`${baseUrl}/health`)
      );
      console.log('Daily health check completed:', new Date().toISOString());
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  }
}