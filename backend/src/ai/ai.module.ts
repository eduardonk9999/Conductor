import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiStatusController } from './ai-status.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AiStatusController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
