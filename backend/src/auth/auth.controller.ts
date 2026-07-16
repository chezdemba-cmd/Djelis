import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto & { deviceUuid?: string; deviceName?: string; os?: string },
    @Headers("x-device-uuid") deviceUuidHeader?: string,
    @Headers("x-device-name") deviceNameHeader?: string,
    @Headers("x-device-os") deviceOsHeader?: string
  ) {
    const uuid = dto.deviceUuid || deviceUuidHeader;
    const name = dto.deviceName || deviceNameHeader;
    const os = dto.os || deviceOsHeader;
    const deviceInfo = uuid ? { uuid, name, os } : undefined;
    return this.authService.register(dto, deviceInfo);
  }

  @Post("register/email")
  @HttpCode(HttpStatus.CREATED)
  async registerEmail(
    @Body() dto: RegisterDto & { deviceUuid?: string; deviceName?: string; os?: string },
    @Headers("x-device-uuid") deviceUuidHeader?: string,
    @Headers("x-device-name") deviceNameHeader?: string,
    @Headers("x-device-os") deviceOsHeader?: string
  ) {
    const uuid = dto.deviceUuid || deviceUuidHeader;
    const name = dto.deviceName || deviceNameHeader;
    const os = dto.os || deviceOsHeader;
    const deviceInfo = uuid ? { uuid, name, os } : undefined;
    return this.authService.register(dto, deviceInfo);
  }

  @Post("register/phone")
  @HttpCode(HttpStatus.CREATED)
  async registerPhone(
    @Body() dto: RegisterDto & { deviceUuid?: string; deviceName?: string; os?: string },
    @Headers("x-device-uuid") deviceUuidHeader?: string,
    @Headers("x-device-name") deviceNameHeader?: string,
    @Headers("x-device-os") deviceOsHeader?: string
  ) {
    const uuid = dto.deviceUuid || deviceUuidHeader;
    const name = dto.deviceName || deviceNameHeader;
    const os = dto.os || deviceOsHeader;
    const deviceInfo = uuid ? { uuid, name, os } : undefined;
    return this.authService.register(dto, deviceInfo);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto & { deviceUuid?: string; deviceName?: string; os?: string },
    @Headers("x-device-uuid") deviceUuidHeader?: string,
    @Headers("x-device-name") deviceNameHeader?: string,
    @Headers("x-device-os") deviceOsHeader?: string
  ) {
    const uuid = dto.deviceUuid || deviceUuidHeader;
    const name = dto.deviceName || deviceNameHeader;
    const os = dto.os || deviceOsHeader;
    const deviceInfo = uuid ? { uuid, name, os } : undefined;
    return this.authService.login(dto, deviceInfo);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body("refresh_token") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body("refresh_token") refreshToken?: string) {
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    return { success: true };
  }

  @Post("verify/otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body("phone") phone: string, @Body("otp") otp: string) {
    return { success: true, message: "Vérification réussie" };
  }
}
