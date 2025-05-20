// libs/health/src/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    console.log('check');
    return this.health.check([
      // Kiểm tra memory không sử dụng quá 150MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Kiểm tra disk có ít nhất 250MB trống
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.75,
        }),
    ]);

    // return this.health.check([
    //   () => this.http.pingCheck('backend', 'http://localhost:4001'),
    // ]);

    // Kiểm tra một service khác (nếu có)
      // () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
  }
}
