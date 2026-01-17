import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import { Issuer } from '@/models/issuer/entities/issuer.entity';
import { User } from '@/models/user/entities/user.entity';

import { paginate } from '@/common/utils/paginate';
import { S3Service } from '@/common/services/s3.service';
import { FileType } from '@/common/enums/file-type.enum';
import { DocumentQueryDto } from './dto/document-query.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,

    @InjectRepository(Issuer)
    private readonly issuerRepository: Repository<Issuer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly s3Service: S3Service,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    if (!file) throw new BadRequestException('Arquivo é obrigatório');

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} não encontrado`);

    const issuer = await this.issuerRepository.findOne({
      where: { id: createDocumentDto.issuerId },
    });

    if (!issuer)
      throw new NotFoundException(
        `Issuer ${createDocumentDto.issuerId} não encontrado`,
      );

    const documentId = randomUUID();
    const uploadPath = `documents/${userId}`;
    let uploadedFile: { key: string; url: string };

    try {
      uploadedFile = await this.s3Service.uploadFile(file, uploadPath);
    } catch (err) {
      throw new InternalServerErrorException('Erro ao fazer upload do arquivo');
    }

    try {
      const document = this.documentRepository.create({
        id: documentId,
        ...createDocumentDto,

        issuer,
        issuerId: issuer.id,

        createdBy: user,
        createdByUserId: user.id,

        fileKey: uploadedFile.key,
        fileUrl: `/api/document/${documentId}/file`,
        fileName: file.originalname,
        fileType: file.mimetype.includes('pdf') ? FileType.PDF : FileType.JPG,
      });

      return await this.documentRepository.save(document);
    } catch (err) {
      await this.s3Service.deleteFile(uploadedFile.key);
      throw err;
    }
  }

  async findAll(query: DocumentQueryDto, userId: string) {
    const {
      search,
      orderBy,
      order,
      createdFrom,
      createdTo,
      documentType,
      issuerId,
      minTotalTaxAmount,
      maxTotalTaxAmount,
      minNetAmount,
      maxNetAmount,
    } = query;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.issuer', 'issuer')
      .leftJoinAndSelect('document.createdBy', 'createdBy')
      .where('document.createdByUserId = :userId', { userId });

    if (search) {
      qb.andWhere(
        `
        (
          document.name ILIKE :search OR
          document.documentNumber ILIKE :search OR
          issuer.name ILIKE :search
        )
        `,
        { search: `%${search}%` },
      );
    }

    if (documentType) {
      qb.andWhere('document.documentType = :documentType', {
        documentType,
      });
    }

    if (issuerId) {
      qb.andWhere('document.issuerId = :issuerId', { issuerId });
    }

    if (createdFrom) {
      qb.andWhere('document.createdAt >= :createdFrom', {
        createdFrom,
      });
    }

    if (createdTo) {
      qb.andWhere('document.createdAt <= :createdTo', {
        createdTo,
      });
    }

    if (minTotalTaxAmount !== undefined) {
      qb.andWhere('document.totalTaxAmount >= :minTax', {
        minTax: minTotalTaxAmount,
      });
    }

    if (maxTotalTaxAmount !== undefined) {
      qb.andWhere('document.totalTaxAmount <= :maxTax', {
        maxTax: maxTotalTaxAmount,
      });
    }

    if (minNetAmount !== undefined) {
      qb.andWhere('document.netAmount >= :minNet', {
        minNet: minNetAmount,
      });
    }

    if (maxNetAmount !== undefined) {
      qb.andWhere('document.netAmount <= :maxNet', {
        maxNet: maxNetAmount,
      });
    }

    if (orderBy) {
      qb.orderBy(`document.${orderBy}`, order as 'ASC' | 'DESC' | undefined);
    }

    return paginate(qb, query);
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['issuer', 'createdBy'],
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} não encontrado`);
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    if (updateDocumentDto.issuerId) {
      const issuer = await this.issuerRepository.findOne({
        where: { id: updateDocumentDto.issuerId },
      });

      if (!issuer) {
        throw new NotFoundException(
          `Issuer ${updateDocumentDto.issuerId} não encontrado`,
        );
      }
    }

    const document = await this.documentRepository.preload({
      id,
      ...updateDocumentDto,
    });

    if (!document) {
      throw new NotFoundException(`Document ${id} não encontrado`);
    }

    return this.documentRepository.save(document);
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    return this.documentRepository.remove(document);
  }

  async getFileStream(documentId: string, userId: string) {
    const document = await this.documentRepository.findOne({
      where: {
        id: documentId,
        createdByUserId: userId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (!document.fileKey) {
      throw new NotFoundException('Documento não possui arquivo');
    }

    try {
      const stream = await this.s3Service.getFileStream(document.fileKey);
      return {
        stream,
        fileName: document.fileName,
        mimeType:
          document.fileType === FileType.PDF ? 'application/pdf' : 'image/jpeg',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Erro ao buscar arquivo no storage',
      );
    }
  }
}
