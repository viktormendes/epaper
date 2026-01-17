import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { DocumentType } from '@/common/enums/document-type.enum';

export class DocumentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Data inicial de criação (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Data final de criação (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({
    enum: DocumentType,
    description: 'Tipo do documento',
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'ID do emitente',
  })
  @IsOptional()
  @IsUUID()
  issuerId?: string;

  @ApiPropertyOptional({
    description: 'Valor mínimo de tributos',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTotalTaxAmount?: number;

  @ApiPropertyOptional({
    description: 'Valor máximo de tributos',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTotalTaxAmount?: number;

  @ApiPropertyOptional({
    description: 'Valor líquido mínimo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minNetAmount?: number;

  @ApiPropertyOptional({
    description: 'Valor líquido máximo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxNetAmount?: number;
}
