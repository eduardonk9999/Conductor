import { IsString, IsOptional, IsIn } from 'class-validator';

export class SuggestTextDto {
  /** Tipo do elemento: text | button */
  @IsString()
  @IsIn(['text', 'button'])
  kind: 'text' | 'button';

  /** Texto atual (opcional). Para botão: label do CTA. Para texto: parágrafo existente. */
  @IsOptional()
  @IsString()
  currentText?: string;

  /** Contexto extra: ex. "email de boas-vindas", "promoção Black Friday" */
  @IsOptional()
  @IsString()
  context?: string;
}
