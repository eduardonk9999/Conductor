import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateDocument = Template & Document;

export interface TemplateArea {
  id: string;
  /** 'slice' = fatia da imagem (crop); 'color' = bloco de cor; 'button' selecionado na imagem = crop clicável */
  type: 'slice' | 'color' | 'image' | 'text' | 'button' | 'spacer';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  link?: string;
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: string;
    padding?: string;
    borderRadius?: string;
  };
}

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  originalImageUrl: string;

  @Prop({ type: [Object], default: [] })
  areas: TemplateArea[];

  @Prop({ default: 600 })
  emailWidth: number;

  @Prop({ default: '#ffffff' })
  backgroundColor: string;

  @Prop()
  htmlContent: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Object, default: {} })
  metadata: {
    imageWidth?: number;
    imageHeight?: number;
    detectedTexts?: any[];
    detectedButtons?: any[];
  };
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
