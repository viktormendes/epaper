import { ApiProperty } from '@nestjs/swagger';
import { FileType } from 'src/common/enums/file-type.enum';
import { Origin } from 'src/common/enums/origin.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  documentNumber: string;

  @ApiProperty({ enum: Origin })
  role: Origin;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty()
  totalTaxAmount: number;

  @ApiProperty()
  netAmount: number;

  @ApiProperty({ required: false })
  fileUrl?: string;

  @ApiProperty({ required: false })
  fileName?: string;

  @ApiProperty({ enum: FileType, required: false })
  fileType?: FileType;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  issuerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
