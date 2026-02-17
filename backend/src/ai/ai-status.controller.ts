import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';

/**
 * Endpoint público para verificar se a IA está configurada.
 * Acesse: GET /api/ai/status (ex: http://localhost:3000/api/ai/status)
 */
@Controller('ai')
export class AiStatusController {
  constructor(private aiService: AiService) {}

  @Get('status')
  getStatus() {
    return {
      available: this.aiService.isAvailable(),
      message: this.aiService.isAvailable()
        ? 'IA configurada. Use "Analisar imagem com IA" no editor.'
        : 'Defina no .env do backend: AI_ENABLED=true, AI_PROVIDER=ollama, AI_VISION_MODEL=llava. Depois: ollama pull llava',
    };
  }
}
