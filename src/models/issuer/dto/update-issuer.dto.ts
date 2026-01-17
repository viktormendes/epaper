import { PartialType } from '@nestjs/mapped-types';
import { CreateIssuerDto } from './create-issuer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIssuerDto extends PartialType(CreateIssuerDto) {
  @ApiPropertyOptional({ description: 'Nome do emissor' })
  name?: string;

  @ApiPropertyOptional({ description: 'Código do emissor' })
  code?: string;

  @ApiPropertyOptional({ description: 'Razão social da empresa' })
  companyName?: string;
}
