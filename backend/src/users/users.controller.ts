import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Suppression définitive du compte de l'utilisateur authentifié. */
  @Delete("me")
  @HttpCode(HttpStatus.OK)
  async deleteMe(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
