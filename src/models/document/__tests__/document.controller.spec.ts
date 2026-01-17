import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import request from 'supertest';
import { Readable } from 'stream';

import { JwtAuthGuard } from '@/authentication/guards/jwt-auth/jwt-auth.guard';
import { DocumentController } from '../document.controller';
import { DocumentService } from '../document.service';

class JwtAuthGuardMock {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-id' };
    return true;
  }
}

const mockDocumentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getFileStream: jest.fn(),
};

describe('DocumentController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(JwtAuthGuardMock)
      .compile();

    app = module.createNestApplication();

    /* Mock user no request */
    app.use((req: any, _res, next) => {
      req.user = { id: 'user-id' };
      next();
    });

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /document', () => {
    it('deve criar documento com upload', async () => {
      mockDocumentService.create.mockResolvedValue({
        id: 'doc-id',
      });

      return request(app.getHttpServer())
        .post('/document')
        .field('name', 'Conta de Luz')
        .field('documentNumber', '123')
        .field('issuerId', 'issuer-id')
        .attach('file', Buffer.from('file'), 'file.jpg')
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBe('doc-id');
        });
    });

    it('deve falhar sem arquivo', async () => {
      mockDocumentService.create.mockRejectedValue(
        new BadRequestException('Arquivo é obrigatório'),
      );

      return request(app.getHttpServer())
        .post('/document')
        .field('name', 'Conta')
        .expect(400);
    });
  });

  describe('GET /document', () => {
    it('deve retornar lista de documentos', async () => {
      mockDocumentService.findAll.mockResolvedValue({
        data: [],
        meta: {},
      });

      return request(app.getHttpServer())
        .get('/document')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('data');
        });
    });
  });

  describe('GET /document/:id', () => {
    it('deve retornar documento por id', async () => {
      mockDocumentService.findOne.mockResolvedValue({
        id: 'doc-id',
      });

      return request(app.getHttpServer())
        .get('/document/doc-id')
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe('doc-id');
        });
    });

    it('deve retornar 404 se não existir', async () => {
      mockDocumentService.findOne.mockRejectedValue(new NotFoundException());

      return request(app.getHttpServer()).get('/document/invalid').expect(404);
    });
  });

  describe('GET /document/:id/file', () => {
    it('deve retornar stream do arquivo', async () => {
      const stream = new Readable();
      stream.push('file-content');
      stream.push(null);

      mockDocumentService.getFileStream.mockResolvedValue({
        stream,
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
      });

      const response = await request(app.getHttpServer())
        .get('/document/doc-id/file')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('file.pdf');
    });

    it('deve retornar 404 se documento não tiver arquivo', async () => {
      mockDocumentService.getFileStream.mockRejectedValue(
        new NotFoundException(),
      );

      return request(app.getHttpServer())
        .get('/document/doc-id/file')
        .expect(404);
    });
  });

  describe('PATCH /document/:id', () => {
    it('deve atualizar documento', async () => {
      mockDocumentService.update.mockResolvedValue({
        id: 'doc-id',
      });

      return request(app.getHttpServer())
        .patch('/document/doc-id')
        .send({ name: 'Atualizado' })
        .expect(200);
    });

    it('deve retornar 404 se documento não existir', async () => {
      mockDocumentService.update.mockRejectedValue(new NotFoundException());

      return request(app.getHttpServer())
        .patch('/document/invalid')
        .send({})
        .expect(404);
    });
  });

  describe('DELETE /document/:id', () => {
    it('deve remover documento', async () => {
      mockDocumentService.remove.mockResolvedValue({});

      return request(app.getHttpServer())
        .delete('/document/doc-id')
        .expect(200);
    });

    it('deve retornar 404 se documento não existir', async () => {
      mockDocumentService.remove.mockRejectedValue(new NotFoundException());

      return request(app.getHttpServer())
        .delete('/document/invalid')
        .expect(404);
    });
  });
});
