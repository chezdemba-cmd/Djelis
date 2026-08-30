import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      "Le numéro de téléphone doit être au format international (E.164), ex: +22360000000",
  })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  })
  password: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, {
    message: "Le code pays doit contenir deux lettres majuscules (ISO 3166-1)",
  })
  country_code?: string;
}
