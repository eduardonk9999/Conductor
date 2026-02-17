import { IsString, IsOptional } from 'class-validator';

export class ImproveTextDto {
  @IsString()
  text: string;

  /** Ex: "tom mais formal", "mais curto", "CTA mais urgente" */
  @IsOptional()
  @IsString()
  instruction?: string;
}
