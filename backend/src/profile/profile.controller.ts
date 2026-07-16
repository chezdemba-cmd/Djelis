import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProfileService } from "./profile.service";

@Controller(["profile", "profiles"])
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async list(@Req() req: any) {
    return this.profileService.list(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body("name") name: string,
    @Body("avatar_url") avatarUrl?: string,
    @Body("is_child") isChild?: boolean
  ) {
    return this.profileService.create(req.user.id, {
      name,
      avatarUrl,
      isChild,
    });
  }

  @Put(":id")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("avatar_url") avatarUrl?: string,
    @Body("is_child") isChild?: boolean
  ) {
    return this.profileService.update(req.user.id, id, {
      name,
      avatarUrl,
      isChild,
    });
  }

  @Delete(":id")
  async delete(@Req() req: any, @Param("id") id: string) {
    return this.profileService.delete(req.user.id, id);
  }
}
