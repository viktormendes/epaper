import { Test, TestingModule } from '@nestjs/testing';
import { IssuerService } from '../issuer.service';
import { Issuer } from '../entities/issuer.entity';
import { User } from '@/models/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('IssuerService', () => {
  let service: IssuerService;
  let issuerRepository: jest.Mocked<Repository<Issuer>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuerService,
        {
          provide: getRepositoryToken(Issuer),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(IssuerService);
    issuerRepository = module.get(getRepositoryToken(Issuer));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('deve criar um issuer com sucesso', async () => {
      const dto = { name: 'Issuer', cnpj: '123', companyName: 'Company' };
      const user = { id: 'user-id' } as User;
      const issuer = { id: 'issuer-id' } as Issuer;

      userRepository.findOne.mockResolvedValue(user);
      issuerRepository.create.mockReturnValue(issuer);
      issuerRepository.save.mockResolvedValue(issuer);

      const result = await service.create(dto, user.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(issuerRepository.create).toHaveBeenCalled();
      expect(issuerRepository.save).toHaveBeenCalledWith(issuer);
      expect(result).toEqual(issuer);
    });

    it('deve lançar erro se user não existir', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({} as any, 'invalid-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('deve retornar issuer', async () => {
      const issuer = { id: 'id' } as Issuer;
      issuerRepository.findOne.mockResolvedValue(issuer);

      const result = await service.findOne('id');

      expect(result).toEqual(issuer);
    });

    it('deve lançar NotFoundException', async () => {
      issuerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar issuer', async () => {
      const issuer = { id: 'id' } as Issuer;
      issuerRepository.preload.mockResolvedValue(issuer);
      issuerRepository.save.mockResolvedValue(issuer);

      const result = await service.update('id', { name: 'novo' });

      expect(result).toEqual(issuer);
    });

    it('deve lançar erro se não existir', async () => {
      issuerRepository.preload.mockResolvedValue(undefined);

      await expect(
        service.update('id', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover issuer', async () => {
      const issuer = { id: 'id' } as Issuer;
      jest.spyOn(service, 'findOne').mockResolvedValue(issuer);
      issuerRepository.remove.mockResolvedValue(issuer);

      const result = await service.remove('id');

      expect(result).toEqual(issuer);
    });
  });
});
