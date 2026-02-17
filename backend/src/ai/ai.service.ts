import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemplateArea } from '../templates/schemas/template.schema';
import { v4 as uuidv4 } from 'uuid';

export type AIProvider = 'ollama' | 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

@Injectable()
export class AiService {
  private readonly enabled: boolean;
  private readonly provider: AIProvider;
  private readonly model: string;
  /** Modelo de visão (Ollama: llava, gemma3, etc.; OpenAI: gpt-4o, gpt-4-vision). */
  private readonly visionModel: string;
  private readonly ollamaBaseUrl: string;
  private readonly openaiApiKey: string;
  private readonly openaiBaseUrl: string;

  constructor(private configService: ConfigService) {
    const get = (key: string, fallback = '') =>
      this.configService.get<string>(key) ?? process.env[key] ?? fallback;
    this.enabled = get('AI_ENABLED') === 'true';
    this.provider = (get('AI_PROVIDER') || 'ollama') as AIProvider;
    this.model = get('AI_MODEL') || 'llama3.2';
    this.visionModel = get('AI_VISION_MODEL') || get('AI_MODEL') || 'llava';
    this.ollamaBaseUrl = get('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.openaiApiKey = get('OPENAI_API_KEY');
    this.openaiBaseUrl = get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
  }

  isAvailable(): boolean {
    if (!this.enabled) return false;
    if (this.provider === 'openai' && !this.openaiApiKey) return false;
    return true;
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('IA não está configurada. Defina AI_ENABLED=true e OLLAMA_BASE_URL ou OPENAI_API_KEY.');
    }
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
    if (this.provider === 'ollama') {
      return this.callOllama(messages);
    }
    return this.callOpenAI(messages);
  }

  private async callOllama(messages: ChatMessage[]): Promise<string> {
    const url = `${this.ollamaBaseUrl.replace(/\/$/, '')}/api/chat`;
    const body = {
      model: this.model,
      messages,
      stream: false,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return (data.message?.content ?? '').trim();
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    const url = `${this.openaiBaseUrl.replace(/\/$/, '')}/chat/completions`;
    const body = {
      model: this.model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    return content.trim();
  }

  /** Sugere texto para um bloco de email (parágrafo ou CTA de botão). */
  async suggestText(kind: 'text' | 'button', currentText?: string, context?: string): Promise<string> {
    const system =
      kind === 'button'
        ? 'Você é um redator de email marketing. Responda APENAS com o texto do botão (CTA), em uma linha curta e direta, em português do Brasil. Sem explicações, sem aspas extras.'
        : 'Você é um redator de email marketing. Responda APENAS com o parágrafo sugerido, em português do Brasil. Sem explicações, sem aspas extras.';
    let user = kind === 'button' ? 'Sugira o texto de um botão (CTA) para email.' : 'Sugira um parágrafo curto para um email.';
    if (context) user += ` Contexto: ${context}.`;
    if (currentText) user += ` Texto atual (pode melhorar): ${currentText}.`;
    return this.complete(system, user);
  }

  /** Melhora/reescreve um texto conforme instrução. */
  async improveText(text: string, instruction?: string): Promise<string> {
    const system =
      'Você é um revisor de textos para email marketing. Responda APENAS com o texto reescrito, em português do Brasil. Sem explicações, sem aspas extras.';
    let user = `Reescreva o seguinte texto para email marketing:\n\n${text}`;
    if (instruction) user += `\n\nInstrução: ${instruction}.`;
    return this.complete(system, user);
  }

  /**
   * Analisa a imagem do template e retorna regiões (áreas) para montar a tabela HTML.
   * Requer modelo de visão (Ollama: llava, gemma3; OpenAI: gpt-4o, gpt-4-vision-preview).
   */
  async analyzeEmailImage(
    imageBuffer: Buffer,
    imageWidth: number,
    imageHeight: number,
  ): Promise<TemplateArea[]> {
    if (!this.isAvailable()) {
      throw new Error('IA não está configurada. Para visão use um modelo com suporte a imagem (ex: llava, gemma3).');
    }
    const base64 = imageBuffer.toString('base64');
    const system =
      'Você analisa imagens de templates de email marketing. Sua resposta deve ser APENAS um JSON válido, sem markdown e sem texto antes ou depois.';
    const user = `Imagem ${imageWidth}x${imageHeight} px. Gere um email HTML responsivo (uma coluna).

REGRAS IMPORTANTES:
- Crie POUCAS regiões (blocos grandes e semânticos). Não crie regiões para uma palavra ou ícone só.
- Cada região deve ter NO MÍNIMO 40px de altura e 80px de largura. Ignore detalhes pequenos.
- Banner/cabeçalho no topo = UMA região "slice" cobrindo toda a área (título + subtítulo + botão do header).
- Cada parágrafo de texto = UMA região "text" (parágrafo inteiro, não linha por linha).
- Botão de destaque (CTA) = UMA região "button" com o retângulo do botão.
- Faixas de cor ou separadores = "color". Espaços vazios grandes = "spacer".

Retorne um array JSON. Cada objeto: "type" ("slice"|"text"|"button"|"color"|"spacer"), "x", "y", "width", "height" em pixels, e opcionalmente "content" (texto do bloco, para text/button) e "link" (para button). Ordene por "y" (de cima para baixo). Use números inteiros. Exemplo: [{"type":"slice","x":0,"y":0,"width":600,"height":220},{"type":"text","x":24,"y":240,"width":552,"height":120,"content":"Texto do parágrafo aqui"}]`;
    const raw =
      this.provider === 'ollama'
        ? await this.callOllamaWithImage(user, base64)
        : await this.callOpenAIWithImage(system, user, base64);
    return this.parseAreasFromResponse(raw, imageWidth, imageHeight);
  }

  private async callOllamaWithImage(userPrompt: string, imageBase64: string): Promise<string> {
    const url = `${this.ollamaBaseUrl.replace(/\/$/, '')}/api/chat`;
    const body = {
      model: this.visionModel,
      messages: [{ role: 'user' as const, content: userPrompt, images: [imageBase64] }],
      stream: false,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama (visão): ${res.status} ${err}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return (data.message?.content ?? '').trim();
  }

  private async callOpenAIWithImage(
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string,
  ): Promise<string> {
    const url = `${this.openaiBaseUrl.replace(/\/$/, '')}/chat/completions`;
    const body = {
      model: this.visionModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI (visão): ${res.status} ${err}`);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return (data.choices?.[0]?.message?.content ?? '').trim();
  }

  private static readonly MIN_AREA_WIDTH = 50;
  private static readonly MIN_AREA_HEIGHT = 36;

  private parseAreasFromResponse(
    raw: string,
    imageWidth: number,
    imageHeight: number,
  ): TemplateArea[] {
    let jsonStr = raw.trim();
    const match = jsonStr.match(/\[[\s\S]*\]/);
    if (match) jsonStr = match[0];
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr) as Array<Record<string, unknown>>;
    const allowed: TemplateArea['type'][] = ['slice', 'text', 'button', 'color', 'image', 'spacer'];
    const areas: TemplateArea[] = [];
    for (const item of parsed) {
      const type = (item.type as string) || 'slice';
      const areaType = allowed.includes(type as TemplateArea['type']) ? (type as TemplateArea['type']) : 'slice';
      let x = Number(item.x);
      let y = Number(item.y);
      let width = Number(item.width);
      let height = Number(item.height);
      if (!Number.isFinite(x)) x = 0;
      if (!Number.isFinite(y)) y = 0;
      if (!Number.isFinite(width) || width <= 0) width = Math.min(100, imageWidth);
      if (!Number.isFinite(height) || height <= 0) height = Math.min(40, imageHeight);
      x = Math.max(0, Math.min(x, imageWidth));
      y = Math.max(0, Math.min(y, imageHeight));
      width = Math.max(1, Math.min(width, imageWidth - x));
      height = Math.max(1, Math.min(height, imageHeight - y));
      if (width < AiService.MIN_AREA_WIDTH || height < AiService.MIN_AREA_HEIGHT) continue;
      width = Math.max(width, AiService.MIN_AREA_WIDTH);
      height = Math.max(height, AiService.MIN_AREA_HEIGHT);
      const content = typeof item.content === 'string' ? item.content.trim() : undefined;
      const link = typeof item.link === 'string' ? item.link : undefined;
      const styles: TemplateArea['styles'] = {};
      if (areaType === 'text') {
        styles.fontSize = 16;
        styles.color = '#333333';
        styles.textAlign = 'left';
      }
      if (areaType === 'button') {
        styles.fontSize = 16;
        styles.color = '#ffffff';
        styles.backgroundColor = '#007bff';
      }
      if (areaType === 'color') {
        styles.backgroundColor = '#f0f0f0';
      }
      areas.push({
        id: uuidv4(),
        type: areaType,
        x,
        y,
        width,
        height,
        content: content || (areaType === 'button' ? 'Clique aqui' : areaType === 'text' ? '' : undefined),
        link: areaType === 'button' ? link : undefined,
        styles: Object.keys(styles).length ? styles : undefined,
      });
    }
    const sorted = areas.sort((a, b) => a.y - b.y);
    return this.mergeAdjacentTextAreas(sorted);
  }

  private mergeAdjacentTextAreas(areas: TemplateArea[]): TemplateArea[] {
    const result: TemplateArea[] = [];
    for (const area of areas) {
      if (area.type !== 'text') {
        result.push(area);
        continue;
      }
      const prev = result[result.length - 1];
      const gap = prev && prev.type === 'text' ? area.y - (prev.y + prev.height) : 999;
      if (prev && prev.type === 'text' && gap >= 0 && gap <= 25) {
        const minX = Math.min(prev.x, area.x);
        const maxRight = Math.max(prev.x + prev.width, area.x + area.width);
        const newHeight = area.y + area.height - prev.y;
        const newContent = [prev.content, area.content].filter(Boolean).join(' ');
        result[result.length - 1] = {
          ...prev,
          x: minX,
          width: maxRight - minX,
          height: newHeight,
          content: newContent || prev.content,
        };
      } else {
        result.push(area);
      }
    }
    return result;
  }
}
