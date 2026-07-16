import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../prisma.service";
import { PlansController } from "./plans.controller";
import { RevenueShareController } from "./revenue-share.controller";
import { RevenueShareService } from "./revenue-share.service";

@Module({
  controllers: [PaymentsController, PlansController, RevenueShareController],
  providers: [PaymentsService, PrismaService, RevenueShareService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
