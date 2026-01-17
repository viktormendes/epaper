import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssuerDto {
  @ApiProperty({ description: 'Nome do emissor' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Código do emissor' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Razão social da empresa' })
  @IsNotEmpty()
  @IsString()
  companyName: string;
}
