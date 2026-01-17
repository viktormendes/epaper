import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Readable } from 'stream';

import { Issuer } from '@/models/issuer/entities/issuer.entity';
import { User } from '@/models/user/entities/user.entity';
import { S3Service } from '@/common/services/s3.service';
import { FileType } from '@/common/enums/file-type.enum';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentService } from '../document.service';
import { Document } from '../entities/document.entity';

describe('DocumentService', () => {
  let service: DocumentService;

  let documentRepo: jest.Mocked<Repository<Document>>;
  let issuerRepo: jest.Mocked<Repository<Issuer>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let s3Service: jest.Mocked<S3Service>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Issuer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileStream: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DocumentService);
    documentRepo = module.get(getRepositoryToken(Document));
    issuerRepo = module.get(getRepositoryToken(Issuer));
    userRepo = module.get(getRepositoryToken(User));
    s3Service = module.get(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /*                                  CREATE                                    */
  /* -------------------------------------------------------------------------- */

  describe('create()', () => {
    const mockFile = {
      originalname: 'file.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('file'),
    } as Express.Multer.File;

    it('deve criar documento com upload com sucesso', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-id' } as User);
      issuerRepo.findOne.mockResolvedValue({ id: 'issuer-id' } as Issuer);

      s3Service.uploadFile.mockResolvedValue({
        key: 'documents/user/file.jpg',
        url: 'url',
      });

      documentRepo.create.mockReturnValue({ id: 'doc-id' } as Document);
      documentRepo.save.mockResolvedValue({ id: 'doc-id' } as Document);

      const result = await service.create(
        { issuerId: 'issuer-id' } as any,
        mockFile,
        'user-id',
      );

      expect(s3Service.uploadFile).toHaveBeenCalled();
      expect(documentRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deve falhar se arquivo não for enviado', async () => {
      await expect(
        service.create({} as any, null as any, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve falhar se usuário não existir', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({} as any, mockFile, 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se issuer não existir', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-id' } as User);
      issuerRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ issuerId: 'issuer-id' } as any, mockFile, 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se upload no S3 falhar', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-id' } as User);
      issuerRepo.findOne.mockResolvedValue({ id: 'issuer-id' } as Issuer);

      s3Service.uploadFile.mockRejectedValue(new Error());

      await expect(
        service.create({ issuerId: 'issuer-id' } as any, mockFile, 'user-id'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('deve deletar arquivo se salvar no banco falhar', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-id' } as User);
      issuerRepo.findOne.mockResolvedValue({ id: 'issuer-id' } as Issuer);

      s3Service.uploadFile.mockResolvedValue({
        key: 'file-key',
        url: 'url',
      });

      documentRepo.create.mockReturnValue({} as Document);
      documentRepo.save.mockRejectedValue(new Error());

      await expect(
        service.create({ issuerId: 'issuer-id' } as any, mockFile, 'user-id'),
      ).rejects.toThrow();

      expect(s3Service.deleteFile).toHaveBeenCalledWith('file-key');
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               GET FILE STREAM                              */
  /* -------------------------------------------------------------------------- */

  describe('getFileStream()', () => {
    it('deve retornar stream do arquivo', async () => {
      const stream = new Readable();

      documentRepo.findOne.mockResolvedValue({
        id: 'doc-id',
        createdByUserId: 'user-id',
        fileKey: 'file-key',
        fileName: 'file.pdf',
        fileType: FileType.PDF,
      } as Document);

      s3Service.getFileStream.mockResolvedValue(stream as any);

      const result = await service.getFileStream('doc-id', 'user-id');

      expect(result.stream).toBe(stream);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('deve falhar se documento não existir', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getFileStream('doc-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se documento não pertencer ao usuário', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getFileStream('doc-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se documento não tiver arquivo', async () => {
      documentRepo.findOne.mockResolvedValue({
        id: 'doc-id',
        createdByUserId: 'user-id',
        fileKey: null,
      } as any);

      await expect(
        service.getFileStream('doc-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se S3 falhar ao buscar stream', async () => {
      documentRepo.findOne.mockResolvedValue({
        id: 'doc-id',
        createdByUserId: 'user-id',
        fileKey: 'file-key',
      } as any);

      s3Service.getFileStream.mockRejectedValue(new Error());

      await expect(
        service.getFileStream('doc-id', 'user-id'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                 FIND ONE                                   */
  /* -------------------------------------------------------------------------- */

  describe('findOne()', () => {
    it('deve retornar documento', async () => {
      documentRepo.findOne.mockResolvedValue({ id: 'doc-id' } as Document);

      const result = await service.findOne('doc-id');

      expect(result).toBeDefined();
    });

    it('deve falhar se documento não existir', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('doc-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  describe('update()', () => {
    it('deve atualizar documento com sucesso', async () => {
      issuerRepo.findOne.mockResolvedValue({ id: 'issuer-id' } as Issuer);
      documentRepo.preload.mockResolvedValue({ id: 'doc-id' } as Document);
      documentRepo.save.mockResolvedValue({ id: 'doc-id' } as Document);

      const result = await service.update('doc-id', {
        issuerId: 'issuer-id',
      } as any);

      expect(result).toBeDefined();
    });

    it('deve falhar se issuer não existir', async () => {
      issuerRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('doc-id', { issuerId: 'issuer-id' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar se documento não existir', async () => {
      documentRepo.preload.mockResolvedValue(undefined);

      await expect(service.update('doc-id', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   REMOVE                                   */
  /* -------------------------------------------------------------------------- */

  describe('remove()', () => {
    it('deve remover documento', async () => {
      documentRepo.findOne.mockResolvedValue({ id: 'doc-id' } as Document);
      documentRepo.remove.mockResolvedValue({} as Document);

      const result = await service.remove('doc-id');

      expect(result).toBeDefined();
    });
  });
});
