import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [AuthModule, CatalogModule, PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
