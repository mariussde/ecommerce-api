import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { HealthController } from './controllers/health.controller';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { HealthService } from './services/health.service';
import { SupabaseConfig } from './config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [
    AppController,
    ProductController,
    CategoryController,
    CartController,
    OrderController,
    HealthController,
  ],
  providers: [
    AppService,
    ProductService,
    CategoryService,
    CartService,
    OrderService,
    HealthService,
    SupabaseConfig,
  ],
})
export class AppModule {}