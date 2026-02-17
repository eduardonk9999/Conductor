import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template, TemplateSchema } from './schemas/template.schema';
import { ImagesModule } from '../images/images.module';
import { EmailGeneratorModule } from '../email-generator/email-generator.module';
import { AiModule } from '../ai/ai.module';
import { AiController } from '../ai/ai.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }]),
    ImagesModule,
    EmailGeneratorModule,
    AiModule,
  ],
  controllers: [TemplatesController, AiController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
