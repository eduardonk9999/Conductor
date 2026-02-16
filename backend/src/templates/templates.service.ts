import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/create-template.dto';
import { ImageProcessingService } from '../images/services/image-processing.service';
import { EmailHtmlGeneratorService } from '../email-generator/services/email-html-generator.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    private imageProcessingService: ImageProcessingService,
    private emailHtmlGeneratorService: EmailHtmlGeneratorService,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Template> {
    // Processar imagem
    const { processedBuffer, width, height } =
      await this.imageProcessingService.processImage(file.buffer);

    // Salvar imagem processada
    const filename = `${uuidv4()}.jpg`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'templates');
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, processedBuffer);

    const imageUrl = `/uploads/templates/${filename}`;

    // Criar template
    const template = new this.templateModel({
      ...createTemplateDto,
      userId,
      originalImageUrl: imageUrl,
      metadata: {
        imageWidth: width,
        imageHeight: height,
      },
    });

    return template.save();
  }

  async findAllByUser(userId: string): Promise<Template[]> {
    return this.templateModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublic(): Promise<Template[]> {
    return this.templateModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async findOne(id: string, userId: string): Promise<TemplateDocument> {
    const template = await this.templateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId.toString() !== userId && !template.isPublic) {
      throw new ForbiddenException('Access denied');
    }

    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    userId: string,
  ): Promise<Template> {
    const template = await this.templateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    Object.assign(template, updateTemplateDto);
    return template.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.templateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Deletar arquivo de imagem (originalImageUrl começa com /)
    try {
      const relativePath = template.originalImageUrl.replace(/^\//, '');
      const filepath = path.join(process.cwd(), relativePath);
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting image file:', error);
    }

    await this.templateModel.findByIdAndDelete(id).exec();
  }

  async generateHtml(id: string, userId: string): Promise<{ html: string }> {
    const template = await this.findOne(id, userId);
    const areasToRender = await this.resolveSlicesToImageUrls(template);
    const html = this.emailHtmlGeneratorService.generateEmailHtml(
      areasToRender,
      template.emailWidth,
      template.backgroundColor,
    );
    template.htmlContent = html;
    await template.save();
    return { html };
  }

  /**
   * Converte áreas do tipo 'slice' (fatia da imagem) em áreas do tipo 'image' com URL do crop.
   * Coordenadas do frontend estão no espaço do canvas (largura = emailWidth); convertemos para pixels da imagem.
   */
  private async resolveSlicesToImageUrls(template: TemplateDocument): Promise<Template['areas']> {
    const imageWidth = template.metadata?.imageWidth ?? template.emailWidth;
    const imageHeight = template.metadata?.imageHeight ?? 600;
    const canvasWidth = template.emailWidth || 600;
    const scale = imageWidth / canvasWidth;

    const relativePath = template.originalImageUrl.replace(/^\//, '');
    const imagePath = path.join(process.cwd(), relativePath);
    let imageBuffer: Buffer;
    try {
      imageBuffer = await fs.readFile(imagePath);
    } catch {
      return template.areas;
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'templates', 'slices');
    await fs.mkdir(uploadDir, { recursive: true });

    const resolved: Template['areas'] = [];

    for (const area of template.areas) {
      if (area.type === 'slice' || area.type === 'button') {
        const x = area.x * scale;
        const y = area.y * scale;
        const w = area.width * scale;
        const h = area.height * scale;
        const cropBuffer = await this.imageProcessingService.crop(imageBuffer, x, y, w, h);
        const filename = `${template._id}_${area.id}.jpg`;
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, cropBuffer);
        const sliceUrl = `/uploads/templates/slices/${filename}`;
        if (area.type === 'slice') {
          resolved.push({ ...area, type: 'image', content: sliceUrl });
        } else {
          resolved.push({ ...area, content: sliceUrl });
        }
      } else {
        resolved.push({ ...area });
      }
    }

    return resolved;
  }

  async processOcr(id: string, userId: string): Promise<any> {
    const template = await this.findOne(id, userId);

    const relativePath = template.originalImageUrl.replace(/^\//, '');
    const filepath = path.join(process.cwd(), relativePath);
    const buffer = await fs.readFile(filepath);

    const detectedTexts = await this.imageProcessingService.extractTextWithOCR(buffer);

    if (!template.metadata) template.metadata = {};
    template.metadata.detectedTexts = detectedTexts;
    await template.save();

    return { detectedTexts };
  }

  async detectElements(id: string, userId: string): Promise<any> {
    const template = await this.findOne(id, userId);

    const relativePath = template.originalImageUrl.replace(/^\//, '');
    const filepath = path.join(process.cwd(), relativePath);
    const buffer = await fs.readFile(filepath);

    const detectedButtons = await this.imageProcessingService.detectButtons(buffer);

    if (!template.metadata) template.metadata = {};
    template.metadata.detectedButtons = detectedButtons;
    await template.save();

    return { detectedButtons };
  }
}
