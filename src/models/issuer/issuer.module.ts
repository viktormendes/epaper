import { Module } from '@nestjs/common';
import { IssuerService } from './issuer.service';
import { IssuerController } from './issuer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issuer } from '@/models/issuer/entities/issuer.entity';
import { User } from '@/models/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Issuer, User])],
  controllers: [IssuerController],
  providers: [IssuerService],
})
export class IssuerModule {}
