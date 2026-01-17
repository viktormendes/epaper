import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

import { Document } from './entities/document.entity';
import { Issuer } from '@/models/issuer/entities/issuer.entity';
import { User } from '@/models/user/entities/user.entity';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Issuer,
      User,
    ]),
    CommonModule
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
