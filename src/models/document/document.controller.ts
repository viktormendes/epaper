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
  Res,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { DocumentService } from './document.service';
import { CreateDocumentDto, CreateDocumentWithFileDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import { JwtAuthGuard } from '@/authentication/guards/jwt-auth/jwt-auth.guard';
import { User } from '@/models/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentQueryDto } from './dto/document-query.dto';
import type { Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiBearerAuth('JWT-auth')
@ApiTags('document')
@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo documento com upload de arquivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDocumentWithFileDto})
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.create(dto, file, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os documentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos retornada com sucesso.',
  })
  async findAll(
    @Query() query: DocumentQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentService.findAll(query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um documento pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Documento retornado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado.',
  })
  async findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download/visualização do arquivo do documento' })
  @ApiResponse({ status: 200 })
  async getFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { stream, fileName, mimeType } =
      await this.documentService.getFileStream(id, req.user.id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileName}"`,
    );

    stream.pipe(res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um documento pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Documento atualizado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um documento pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Documento removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento não encontrado.',
  })
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
