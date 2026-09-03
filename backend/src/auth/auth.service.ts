import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(
    dto: RegisterDto,
    deviceInfo?: { uuid: string; name?: string; os?: string }
  ) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        "Veuillez fournir au moins un email ou un numéro de téléphone."
      );
    }

    // Check if user already exists
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException("Cet email est déjà enregistré.");
      }
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException(
          "Ce numéro de téléphone est déjà enregistré."
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user and default profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        profiles: {
          create: {
            name: dto.email ? dto.email.split("@")[0] : "Profil 1",
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    return await this.generateUserTokens(user.id, user.role, deviceInfo);
  }

  async login(
    dto: LoginDto,
    deviceInfo?: { uuid: string; name?: string; os?: string }
  ) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        "Veuillez fournir votre email ou numéro de téléphone."
      );
    }

    let user;
    if (dto.email) {
      user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    } else if (dto.phone) {
      user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        "Identifiants incorrects ou compte désactivé."
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    return await this.generateUserTokens(user.id, user.role, deviceInfo);
  }

  async refresh(refreshToken: string) {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtRefreshSecret,
      });

      // Calculate token hash
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // Verify that session exists in DB and is not expired
      const session = await this.prisma.session.findUnique({
        where: { tokenHash },
      });

      if (!session || session.expiresAt.getTime() < Date.now()) {
        throw new UnauthorizedException(
          "Session révoquée, invalide ou expirée."
        );
      }

      // Rotate token: delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      // Generate new tokens (creates a new session)
      return await this.generateUserTokens(payload.sub, payload.role, {
        uuid: session.deviceUuid || undefined,
      });
    } catch (e) {
      throw new UnauthorizedException(
        "Token de rafraîchissement invalide, expiré ou révoqué."
      );
    }
  }

  async requestOtp(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    // Réponse générique dans tous les cas pour éviter l'énumération de comptes.
    if (!user) return { success: true };

    const code = crypto.randomInt(100000, 999999).toString();
    const otpCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCodeHash, otpExpiresAt },
    });

    // Aucun fournisseur SMS n'est configuré dans ce projet : on journalise le
    // code au lieu de l'envoyer, à la manière des paiements déjà simulés.
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.AUTH_DEBUG_CODES === "true"
    ) {
      console.warn(`[AUTH DEBUG] OTP for ${phone}: ${code}`);
    }

    return { success: true };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      throw new UnauthorizedException("Code invalide ou expiré.");
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("Code invalide ou expiré.");
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(otp || "")
      .digest("hex");
    if (otpHash !== user.otpCodeHash) {
      throw new UnauthorizedException("Code invalide ou expiré.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCodeHash: null, otpExpiresAt: null },
    });

    return { success: true, message: "Vérification réussie" };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const passwordResetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetTokenHash, passwordResetExpiresAt },
      });

      // Aucun fournisseur d'e-mail n'est configuré dans ce projet : on
      // journalise le lien au lieu de l'envoyer.
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.AUTH_DEBUG_CODES === "true"
      ) {
        console.warn(
          `[AUTH DEBUG] Password reset token for ${email}: ${token}`
        );
      }
    }

    // Réponse générique dans tous les cas pour éviter l'énumération de comptes.
    return {
      success: true,
      message: "Si ce compte existe, un lien de réinitialisation a été envoyé.",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        "Le mot de passe doit contenir au moins 8 caracteres."
      );
    }
    const tokenHash = crypto
      .createHash("sha256")
      .update(token || "")
      .digest("hex");
    const user = await this.prisma.user.findFirst({
      where: { passwordResetTokenHash: tokenHash },
    });

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        "Lien de réinitialisation invalide ou expiré."
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    // Invalide toutes les sessions actives par sécurité après un changement de mot de passe.
    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    return { success: true };
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    try {
      await this.prisma.session.delete({
        where: { tokenHash },
      });
    } catch (_) {
      // Ignore if session does not exist
    }
  }

  private async generateUserTokens(
    userId: string,
    role: string,
    deviceInfo?: { uuid: string; name?: string; os?: string }
  ) {
    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;

    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
      secret: jwtSecret,
    });
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: crypto.randomUUID() },
      {
        expiresIn: "30d",
        secret: jwtRefreshSecret,
      }
    );

    if (deviceInfo?.uuid) {
      await this.prisma.device.upsert({
        where: {
          userId_deviceUuid: {
            userId,
            deviceUuid: deviceInfo.uuid,
          },
        },
        update: {
          deviceName: deviceInfo.name || null,
          os: deviceInfo.os || null,
          lastActiveAt: new Date(),
        },
        create: {
          userId,
          deviceUuid: deviceInfo.uuid,
          deviceName: deviceInfo.name || null,
          os: deviceInfo.os || null,
        },
      });

      // Clean up previous sessions for this user on this device to avoid accumulation
      await this.prisma.session.deleteMany({
        where: {
          userId,
          deviceUuid: deviceInfo.uuid,
        },
      });
    }

    // Hash the refresh token
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Save active session in DB (30 days validity matching JWT expiration)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        deviceUuid: deviceInfo?.uuid || null,
        expiresAt,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
        subscriptions: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Utilisateur introuvable.");
    }

    const activeSub = user.subscriptions.some(
      (sub) => sub.status === "ACTIVE" && sub.endsAt.getTime() > Date.now()
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email || null,
        phone: user.phone || null,
        phone_verified: true,
        email_verified: true,
        status: user.isActive ? "active" : "suspended",
        country_code: null,
        profile: {
          display_name: user.profiles[0]?.name || "Profil 1",
          avatar_url: user.profiles[0]?.avatarUrl || null,
        },
        has_active_subscription: activeSub,
      },
    };
  }
}
