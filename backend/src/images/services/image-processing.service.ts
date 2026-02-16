import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { ConfigService } from '@nestjs/config';

export interface DetectedText {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface DetectedButton {
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

@Injectable()
export class ImageProcessingService {
  constructor(private configService: ConfigService) {}

  async processImage(buffer: Buffer): Promise<{
    processedBuffer: Buffer;
    width: number;
    height: number;
  }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    if (width === 0 || height === 0) {
      throw new BadRequestException('Imagem inválida: não foi possível obter dimensões');
    }

    const maxWidth = Math.min(width, 1200);
    const processedBuffer = await image
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      processedBuffer,
      width: processedMetadata.width ?? width,
      height: processedMetadata.height ?? height,
    };
  }

  async extractTextWithOCR(buffer: Buffer): Promise<DetectedText[]> {
    const worker = await createWorker('por+eng');

    try {
      const { data } = await worker.recognize(buffer);
      
      const detectedTexts: DetectedText[] = data.words.map((word) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: {
          x0: word.bbox.x0,
          y0: word.bbox.y0,
          x1: word.bbox.x1,
          y1: word.bbox.y1,
        },
      }));

      await worker.terminate();
      return detectedTexts.filter(t => t.confidence > 60);
    } catch (error) {
      await worker.terminate();
      throw error;
    }
  }

  async detectButtons(buffer: Buffer): Promise<DetectedButton[]> {
    // Algoritmo simples de detecção de botões baseado em análise de bordas
    // Em produção, considere usar ML/CV mais avançado
    const image = sharp(buffer);
    const { width, height } = await image.metadata();

    // Converter para escala de cinza e detectar bordas
    const edgeBuffer = await image
      .greyscale()
      .normalise()
      .toBuffer();

    // Aqui implementaríamos lógica mais sofisticada
    // Por enquanto, retornamos array vazio
    // TODO: Implementar detecção real de botões
    return [];
  }

  async createThumbnail(buffer: Buffer, width: number = 300): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * Recorta uma região da imagem (para fatias/slices do email).
   * x, y, width, height em pixels da imagem original.
   */
  async crop(buffer: Buffer, x: number, y: number, width: number, height: number): Promise<Buffer> {
    const left = Math.max(0, Math.round(x));
    const top = Math.max(0, Math.round(y));
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    return sharp(buffer)
      .extract({ left, top, width: w, height: h })
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
