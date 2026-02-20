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
   *
   * Estratégia híbrida:
   * 1. Sharp segmenta a imagem em blocos horizontais via análise de pixels
   *    (detecta automaticamente onde termina área gráfica e começa fundo liso)
   * 2. Para cada bloco com fundo liso, a IA classifica se é text/button/color/spacer
   *    e extrai o texto visível (tarefa simples e confiável)
   * 3. Blocos com fundo complexo/gráfico viram "slice" automaticamente (sem IA)
   */
  async analyzeEmailImage(
    imageBuffer: Buffer,
    imageWidth: number,
    imageHeight: number,
  ): Promise<TemplateArea[]> {
    if (!this.isAvailable()) {
      throw new Error('IA não está configurada. Para visão use um modelo com suporte a imagem (ex: llava, gemma3).');
    }

    // 1. Segmentação automática por pixels
    const segments = await this.segmentImageByPixels(imageBuffer, imageWidth, imageHeight);
    console.log('[AI] Segments found by pixel analysis:', segments.map(s => `${s.type}(y=${s.y},h=${s.height})`).join(', '));

    // 2. Para segmentos com fundo liso, pede à IA para classificar e extrair texto
    const areas: TemplateArea[] = [];
    for (const seg of segments) {
      if (seg.type === 'slice') {
        // Área gráfica: não precisa de IA, vai virar imagem recortada
        areas.push({ id: uuidv4(), type: 'slice', x: 0, y: seg.y, width: imageWidth, height: seg.height });
      } else {
        // Fundo liso: IA classifica e extrai texto do crop deste bloco
        const classified = await this.classifyFlatBlock(imageBuffer, imageWidth, seg, imageHeight);
        areas.push(classified);
      }
    }

    return areas;
  }

  /**
   * Analisa os pixels da imagem linha por linha com Sharp e agrupa em segmentos:
   * - "slice": linhas com pixels variados/coloridos (área gráfica)
   * - "flat": linhas com cor de fundo quase uniforme (branco, cinza claro etc.)
   *
   * Retorna blocos consolidados, fundindo linhas adjacentes do mesmo tipo.
   */
  private async segmentImageByPixels(
    buffer: Buffer,
    imageWidth: number,
    imageHeight: number,
  ): Promise<Array<{ type: 'slice' | 'flat'; y: number; height: number; bgColor?: string }>> {
    const SAMPLE_W = 80;
    const sampleH = Math.round(imageHeight * SAMPLE_W / imageWidth);

    const { data } = await (await import('sharp')).default(buffer)
      .resize(SAMPLE_W, sampleH, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = 3;
    const lineTypes: Array<{ type: 'slice' | 'flat'; bgColor: string }> = [];

    for (let row = 0; row < sampleH; row++) {
      const offset = row * SAMPLE_W * channels;
      // Histograma de cor por canal (8 buckets de 32 valores cada)
      const rB = new Array(8).fill(0);
      const gB = new Array(8).fill(0);
      const bB = new Array(8).fill(0);
      let sumR = 0, sumG = 0, sumB = 0;

      for (let col = 0; col < SAMPLE_W; col++) {
        const i = offset + col * channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        rB[Math.floor(r / 32)]++;
        gB[Math.floor(g / 32)]++;
        bB[Math.floor(b / 32)]++;
        sumR += r; sumG += g; sumB += b;
      }

      // Dominância: % de pixels no bucket mais frequente de cada canal
      const domR = Math.max(...rB) / SAMPLE_W;
      const domG = Math.max(...gB) / SAMPLE_W;
      const domB = Math.max(...bB) / SAMPLE_W;
      const avgDominance = (domR + domG + domB) / 3;

      const avgR = Math.round(sumR / SAMPLE_W);
      const avgG = Math.round(sumG / SAMPLE_W);
      const avgB = Math.round(sumB / SAMPLE_W);
      const lightness = (avgR + avgG + avgB) / 3;

      // Fundo liso: cor dominante concentrada (histograma com pico alto) E fundo claro
      // Isso distingue texto preto sobre branco (flat) de gradientes/fotos coloridas (slice)
      const isFlat = avgDominance > 0.55 && lightness > 180;

      const bgHex = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
      lineTypes.push({ type: isFlat ? 'flat' : 'slice', bgColor: bgHex });
    }

    // Consolida linhas adjacentes do mesmo tipo em blocos
    // Converte coordenadas de volta para a escala original
    const scale = imageHeight / sampleH;
    const raw: Array<{ type: 'slice' | 'flat'; y: number; height: number; bgColor: string }> = [];
    let i = 0;
    while (i < lineTypes.length) {
      const startI = i;
      const { type, bgColor } = lineTypes[i];
      while (i < lineTypes.length && lineTypes[i].type === type) i++;
      const y = Math.round(startI * scale);
      const endY = Math.min(imageHeight, Math.round(i * scale));
      raw.push({ type, y, height: endY - y, bgColor });
    }

    // Mescla blocos muito pequenos com o vizinho (evita fragmentação)
    const MIN_BLOCK = 30;
    const merged = this.mergeSmallBlocks(raw, MIN_BLOCK, imageHeight);
    return merged;
  }

  /**
   * Funde blocos menores que minHeight com o vizinho mais próximo.
   */
  private mergeSmallBlocks(
    blocks: Array<{ type: 'slice' | 'flat'; y: number; height: number; bgColor: string }>,
    minHeight: number,
    imageHeight: number,
  ) {
    let changed = true;
    let arr = [...blocks];
    while (changed) {
      changed = false;
      const next: typeof arr = [];
      let j = 0;
      while (j < arr.length) {
        const cur = arr[j];
        if (cur.height < minHeight && arr.length > 1) {
          // Funde com o vizinho que tiver o mesmo tipo, senão com o próximo
          const prev = next[next.length - 1];
          const nxt = arr[j + 1];
          if (prev && (!nxt || prev.type === cur.type)) {
            prev.height += cur.height;
            changed = true;
          } else if (nxt) {
            arr[j + 1] = { ...nxt, y: cur.y, height: cur.height + nxt.height };
            changed = true;
          } else {
            next.push(cur);
          }
        } else {
          next.push(cur);
        }
        j++;
      }
      arr = next;
    }
    // Recalcula y sequencialmente para garantir continuidade
    let cursor = 0;
    for (const b of arr) { b.y = cursor; cursor += b.height; }
    if (arr.length > 0) arr[arr.length - 1].height += imageHeight - cursor;
    return arr;
  }

  /**
   * Dado um bloco de fundo liso (flat), pede à IA para:
   * - Classificar: "text", "button", "color" ou "spacer"
   * - Extrair o texto visível (se houver)
   * - Identificar a cor de fundo e do botão
   *
   * Envia apenas o crop deste bloco para a IA — imagem menor, resposta mais precisa.
   */
  private async classifyFlatBlock(
    fullBuffer: Buffer,
    imageWidth: number,
    seg: { y: number; height: number; bgColor?: string },
    imageHeight: number,
  ): Promise<TemplateArea> {
    // Recorta só o bloco em questão
    const top = Math.max(0, seg.y);
    const height = Math.min(seg.height, imageHeight - top);
    let cropBase64: string;
    try {
      const sharp = (await import('sharp')).default;
      const cropBuf = await sharp(fullBuffer)
        .extract({ left: 0, top, width: imageWidth, height: Math.max(1, height) })
        .jpeg({ quality: 85 })
        .toBuffer();
      cropBase64 = cropBuf.toString('base64');
    } catch {
      // Se o crop falhar, retorna spacer
      return { id: uuidv4(), type: 'spacer', x: 0, y: seg.y, width: imageWidth, height: seg.height };
    }

    const system = `You are an email block classifier. Output ONLY a single-line JSON object. No explanation.`;
    const user = `This is a cropped section of an email on a plain/white background.
Classify it and respond with a single JSON object:
{"type":"text"|"button"|"color"|"spacer", "content":"exact visible text or empty string", "bgColor":"#rrggbb"}

Rules:
- "text": contains readable paragraph text → include ALL visible text in "content"
- "button": contains a CTA/button label → put label in "content", button bg color in "bgColor"
- "color": solid color stripe with no meaningful text → put its color in "bgColor"
- "spacer": blank whitespace → content and bgColor can be empty

Respond with ONLY the JSON object, one line.`;

    let raw = '';
    try {
      raw = this.provider === 'ollama'
        ? await this.callOllamaWithImage(user, cropBase64)
        : await this.callOpenAIWithImage(system, user, cropBase64);
      console.log(`[AI] Block y=${seg.y} classified:`, raw.substring(0, 200));
    } catch {
      // Se IA falhar no bloco individual, assume spacer
      return { id: uuidv4(), type: 'spacer', x: 0, y: seg.y, width: imageWidth, height: seg.height };
    }

    return this.parseBlockClassification(raw, seg, imageWidth);
  }

  /**
   * Faz o parse da resposta de classificação de um bloco individual.
   */
  private parseBlockClassification(
    raw: string,
    seg: { y: number; height: number; bgColor?: string },
    imageWidth: number,
  ): TemplateArea {
    let jsonStr = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const match = jsonStr.match(/\{[\s\S]*?\}/);
    if (match) jsonStr = match[0];

    let obj: Record<string, unknown> = {};
    try { obj = JSON.parse(jsonStr) as Record<string, unknown>; } catch { /* usa defaults */ }

    const allowed = ['text', 'button', 'color', 'spacer'] as const;
    type FlatType = typeof allowed[number];
    const rawType = obj.type as string;
    const blockType: FlatType = allowed.includes(rawType as FlatType) ? (rawType as FlatType) : 'spacer';

    const content = typeof obj.content === 'string' ? obj.content.trim() : '';
    const bgColor = (typeof obj.bgColor === 'string' ? obj.bgColor : seg.bgColor) || '#ffffff';

    const styles: TemplateArea['styles'] = {};
    if (blockType === 'text') {
      styles.fontSize = 16;
      styles.color = '#333333';
      styles.textAlign = 'left';
      styles.padding = '12px 24px';
    }
    if (blockType === 'button') {
      styles.backgroundColor = bgColor;
      styles.color = this.contrastColor(bgColor);
      styles.fontSize = 16;
      styles.borderRadius = '4px';
      styles.padding = '14px 32px';
    }
    if (blockType === 'color') {
      styles.backgroundColor = bgColor;
    }

    return {
      id: uuidv4(),
      type: blockType,
      x: 0,
      y: seg.y,
      width: imageWidth,
      height: seg.height,
      content: content || (blockType === 'button' ? 'Clique aqui' : blockType === 'text' ? '' : undefined),
      link: blockType === 'button' ? '#' : undefined,
      styles: Object.keys(styles).length ? styles : undefined,
    };
  }

  /** Retorna preto ou branco dependendo do contraste com a cor de fundo (WCAG). */
  private contrastColor(hex: string): string {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
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

}
