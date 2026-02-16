import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateArea } from '../schemas/template.schema';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  emailWidth?: number;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  areas?: TemplateArea[];

  @IsOptional()
  @IsNumber()
  emailWidth?: number;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
