import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { FileType } from 'src/common/enums/file-type.enum';
import { Origin } from 'src/common/enums/origin.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Nome do documento' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Número do documento' })
  @IsNotEmpty()
  @IsString()
  documentNumber: string;

  @ApiProperty({
    description: 'Origem do documento',
    enum: Origin,
  })
  @IsEnum(Origin)
  role: Origin;

  @ApiProperty({
    description: 'Tipo do documento',
    enum: DocumentType,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'Valor total de impostos',
    example: 150.75,
  })
  @IsNumber()
  @Min(0)
  totalTaxAmount: number;

  @ApiProperty({
    description: 'Valor líquido do documento',
    example: 1000.0,
  })
  @IsNumber()
  @Min(0)
  netAmount: number;

  @ApiPropertyOptional({
    description: 'Descrição adicional do documento',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID do emissor (Issuer)',
  })
  @IsUUID()
  issuerId: string;
}

export class CreateDocumentWithFileDto extends CreateDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo do documento',
  })
  file: any;
}
