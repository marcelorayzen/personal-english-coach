import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCoachTurnDto {
  @IsString()
  @IsNotEmpty({ message: 'learnerText nao pode ser vazio' })
  @Matches(/\S/, {
    message: 'learnerText deve conter caracteres nao vazios',
  })
  @MaxLength(4000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  learnerText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  languageCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10 * 60 * 1000)
  durationMs?: number;
}
