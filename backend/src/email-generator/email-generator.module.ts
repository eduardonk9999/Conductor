import { Module } from '@nestjs/common';
import { EmailHtmlGeneratorService } from './services/email-html-generator.service';

@Module({
  providers: [EmailHtmlGeneratorService],
  exports: [EmailHtmlGeneratorService],
})
export class EmailGeneratorModule {}
