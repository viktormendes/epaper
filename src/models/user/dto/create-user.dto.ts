import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Primeiro nome do usuário' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Sobrenome do usuário' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'URL da imagem de avatar do usuário' })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  password: string;
}
