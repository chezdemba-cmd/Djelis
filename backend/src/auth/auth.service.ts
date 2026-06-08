import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Veuillez fournir au moins un email ou un numéro de téléphone.');
    }

    // Check if user already exists
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Cet email est déjà enregistré.');
      }
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà enregistré.');
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
            name: dto.email ? dto.email.split('@')[0] : 'Profil 1',
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    return this.generateUserTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Veuillez fournir votre email ou numéro de téléphone.');
    }

    let user;
    if (dto.email) {
      user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    } else if (dto.phone) {
      user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants incorrects ou compte désactivé.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    return this.generateUserTokens(user.id, user.role);
  }

  private generateUserTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET || 'djelis_secret_key_123',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET || 'djelis_refresh_secret_key_789',
      }),
    };
  }
}
