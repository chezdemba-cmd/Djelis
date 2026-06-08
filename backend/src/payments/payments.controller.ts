import { Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(
    @Req() req: any,
    @Body('plan_id') planId: number,
    @Body('gateway') gateway: string,
    @Body('phone_momo') phoneMomo?: string,
  ) {
    const userId = req.user.id;
    return this.paymentsService.createTransaction(userId, planId, gateway, phoneMomo);
  }

  // Gateway IP validation should be added in a production interceptor/guard
  @Post('webhooks/:gateway')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('gateway') gateway: string,
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(gateway, body);
  }
}
