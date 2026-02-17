import { BadRequestException, Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { AiService } from './ai.service';
import { SuggestTextDto } from './dto/suggest-text.dto';
import { ImproveTextDto } from './dto/improve-text.dto';
import { TemplatesService } from '../templates/templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private templatesService: TemplatesService,
  ) {}

  @Get(':id/ai/status')
  async getAiStatus(
    @Request() req: { user: { userId: string } },
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    await this.templatesService.findOne(id, req.user.userId);
    return { available: this.aiService.isAvailable() };
  }

  @Post(':id/ai/suggest-text')
  async suggestText(
    @Request() req: { user: { userId: string } },
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SuggestTextDto,
  ) {
    await this.templatesService.findOne(id, req.user.userId);
    const text = await this.aiService.suggestText(dto.kind, dto.currentText, dto.context);
    return { text };
  }

  @Post(':id/ai/improve-text')
  async improveText(
    @Request() req: { user: { userId: string } },
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ImproveTextDto,
  ) {
    await this.templatesService.findOne(id, req.user.userId);
    const text = await this.aiService.improveText(dto.text, dto.instruction);
    return { text };
  }

  /** Analisa a imagem do template com IA (visão) e gera as áreas da tabela. */
  @Post(':id/ai/analyze-image')
  async analyzeImage(
    @Request() req: { user: { userId: string } },
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    try {
      return await this.templatesService.analyzeImageWithAi(id, req.user.userId);
    } catch (err: any) {
      const message =
        err?.message ||
        'Não foi possível analisar a imagem. Verifique se a IA está configurada (AI_ENABLED=true, AI_VISION_MODEL=llava) e se o Ollama está rodando: ollama pull llava';
      throw new BadRequestException(message);
    }
  }
}
