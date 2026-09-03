import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from "class-validator";

// Chemins générés par /admin/uploads/sign : "media/..." ou "covers/...".
// On rejette tout le reste pour éviter qu'un contenu pointe vers un objet arbitraire.
const STORAGE_PATH = /^(media|covers)\/[A-Za-z0-9._-]{1,200}$/;

// URL YouTube acceptée (l'ID exact est extrait côté service).
const YOUTUBE_URL =
  /^https?:\/\/(www\.|m\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\/.+/i;

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

  // Source A : média téléversé sur Supabase Storage. Requis sauf si une URL
  // YouTube est fournie.
  @ValidateIf((o) => !o.youtubeUrl)
  @IsString()
  @Matches(STORAGE_PATH, { message: "mediaPath invalide." })
  mediaPath?: string;

  // Source B : lien YouTube (contenu gratuit/promo). Requis sauf si un
  // mediaPath est fourni.
  @ValidateIf((o) => !o.mediaPath)
  @IsString()
  @MaxLength(300)
  @Matches(YOUTUBE_URL, { message: "Lien YouTube invalide." })
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(STORAGE_PATH, { message: "coverPath invalide." })
  coverPath?: string;
}
