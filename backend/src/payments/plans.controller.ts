import { Controller, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('plans')
export class PlansController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async getPlans(@Query('country') country?: string) {
    return this.paymentsService.getPlans(country);
  }
}
