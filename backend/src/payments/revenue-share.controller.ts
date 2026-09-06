import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RevenueShareService } from "./revenue-share.service";

@Controller("payments/revenue-share")
@UseGuards(JwtAuthGuard)
export class RevenueShareController {
  constructor(private revenueShareService: RevenueShareService) {}

  @Get()
  async getRevenueShareSplit(
    @Req() req: any,
    @Query("start_date") startDate?: string,
    @Query("end_date") endDate?: string
  ) {
    // Réservé aux rôles d'administration (cohérent avec @Roles sur /admin).
    if (!["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
      throw new ForbiddenException(
        "Seuls les administrateurs ont accès au partage de revenus."
      );
    }

    if (!startDate || !endDate) {
      throw new BadRequestException(
        "Veuillez spécifier start_date et end_date au format YYYY-MM-DD."
      );
    }

    return this.revenueShareService.calculatePeriodSplit(startDate, endDate);
  }
}
