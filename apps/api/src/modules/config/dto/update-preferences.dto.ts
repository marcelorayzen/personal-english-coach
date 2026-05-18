import { CorrectionIntensity, PtBrSupportLevel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(PtBrSupportLevel)
  ptBrSupportLevel?: PtBrSupportLevel;

  @IsOptional()
  @IsEnum(CorrectionIntensity)
  correctionIntensity?: CorrectionIntensity;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  learningGoal?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  currentFocus?: string | null;
}
