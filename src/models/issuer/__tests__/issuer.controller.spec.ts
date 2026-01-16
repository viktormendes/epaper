import { Test, TestingModule } from '@nestjs/testing';
import { IssuerController } from '../issuer.controller';
import { IssuerService } from '../issuer.service';
import { JwtAuthGuard } from '@/authentication/guards/jwt-auth/jwt-auth.guard';

describe('IssuerController', () => {
  let controller: IssuerController;
  let service: jest.Mocked<IssuerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuerController],
      providers: [
        {
          provide: IssuerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(IssuerController);
    service = module.get(IssuerService);
  });

  it('create deve chamar service.create', async () => {
    const dto = { name: 'Issuer' };
    const req = { user: { id: 'user-id' } } as any;

    await controller.create(dto as any, req);

    expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
  });

  it('findAll deve chamar service.findAll', async () => {
    await controller.findAll({} as any);

    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne deve chamar service.findOne', async () => {
    await controller.findOne('id');

    expect(service.findOne).toHaveBeenCalledWith('id');
  });

  it('update deve chamar service.update', async () => {
    await controller.update('id', {});

    expect(service.update).toHaveBeenCalledWith('id', {});
  });

  it('remove deve chamar service.remove', async () => {
    await controller.remove('id');

    expect(service.remove).toHaveBeenCalledWith('id');
  });
});
