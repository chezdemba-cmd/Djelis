import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

// Chemins générés par /admin/uploads/sign : "media/..." ou "covers/...".
// On rejette tout le reste pour éviter qu'un contenu pointe vers un objet arbitraire.
const STORAGE_PATH = /^(media|covers)\/[A-Za-z0-9._-]{1,200}$/;

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  synopsis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  publishedAtStart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  publishedAtEnd?: string;

  @IsString()
  @Matches(STORAGE_PATH, { message: "mediaPath invalide." })
  mediaPath: string;

  @IsOptional()
  @IsString()
  @Matches(STORAGE_PATH, { message: "coverPath invalide." })
  coverPath?: string;
}
