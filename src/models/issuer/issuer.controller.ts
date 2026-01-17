import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IssuerService } from './issuer.service';
import { CreateIssuerDto } from './dto/create-issuer.dto';
import { UpdateIssuerDto } from './dto/update-issuer.dto';
import { User } from '@/models/user/entities/user.entity';
import { JwtAuthGuard } from '@/authentication/guards/jwt-auth/jwt-auth.guard';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiBearerAuth('JWT-auth')
@ApiTags('issuer')
@UseGuards(JwtAuthGuard)
@Controller('issuer')
export class IssuerController {
  constructor(private readonly issuerService: IssuerService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo emissor' })
  @ApiResponse({ status: 201, description: 'Emissor criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de validação.' })
  async create(
    @Body() createIssuerDto: CreateIssuerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.issuerService.create(createIssuerDto, req.user.id as string);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os emissores' })
  @ApiResponse({ status: 200, description: 'Lista de emissores retornada com sucesso.' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.issuerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um emissor pelo ID' })
  @ApiResponse({ status: 200, description: 'Emissor retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Emissor não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.issuerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um emissor pelo ID' })
  @ApiResponse({ status: 200, description: 'Emissor atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Emissor não encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateIssuerDto: UpdateIssuerDto,
  ) {
    return this.issuerService.update(id, updateIssuerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um emissor pelo ID' })
  @ApiResponse({ status: 200, description: 'Emissor removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Emissor não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.issuerService.remove(id);
  }
}
