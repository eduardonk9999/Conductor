import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/create-template.dto';
import { multerConfig } from '../config/multer.config';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Request() req,
    @Body() createTemplateDto: CreateTemplateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.templatesService.create(
      createTemplateDto,
      file,
      req.user.userId,
    );
  }

  @Get()
  async findAll(@Request() req) {
    return this.templatesService.findAllByUser(req.user.userId);
  }

  @Get('public')
  async findPublic() {
    return this.templatesService.findPublic();
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.templatesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto, req.user.userId);
  }

  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.templatesService.remove(id, req.user.userId);
  }

  @Post(':id/generate-html')
  async generateHtml(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.templatesService.generateHtml(id, req.user.userId);
  }

  @Post(':id/process-ocr')
  async processOcr(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.templatesService.processOcr(id, req.user.userId);
  }

  @Post(':id/detect-elements')
  async detectElements(
    @Request() req,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.templatesService.detectElements(id, req.user.userId);
  }
}
