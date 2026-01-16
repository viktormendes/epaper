import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssuerDto {
  @ApiProperty({ description: 'Nome do emissor' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'CNPJ do emissor' })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({ description: 'Razão social da empresa' })
  @IsNotEmpty()
  @IsString()
  companyName: string;
}
