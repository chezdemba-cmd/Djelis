import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

/**
 * Demande d'URL signée pour un upload direct navigateur -> Supabase Storage.
 * Le fichier lui-même ne transite jamais par l'API (contrainte serverless Vercel).
 */
export class SignUploadDto {
  @IsIn(["media", "cover"])
  kind: "media" | "cover";

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  contentType: string;
}
