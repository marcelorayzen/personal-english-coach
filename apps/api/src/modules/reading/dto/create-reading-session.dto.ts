import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateReadingSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'targetText nao pode ser vazio' })
  @Matches(/\S/, { message: 'targetText deve conter caracteres nao vazios' })
  @MaxLength(4000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  targetText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  languageCode?: string;
}
