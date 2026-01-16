import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issuer } from './entities/issuer.entity';
import { CreateIssuerDto } from './dto/create-issuer.dto';
import { UpdateIssuerDto } from './dto/update-issuer.dto';
import { User } from '@/models/user/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { paginate } from '@/common/utils/paginate';
@Injectable()
export class IssuerService {
  constructor(
    @InjectRepository(Issuer)
    private readonly issuerRepository: Repository<Issuer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createIssuerDto: CreateIssuerDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User com id ${userId} não encontrado`);
    }
    const issuer = this.issuerRepository.create({
      ...createIssuerDto,
      createdBy: user,
      createdByUserId: user.id,
    });
    return this.issuerRepository.save(issuer);
  }

  async findAll(pagination: PaginationQueryDto) {
    const { search, orderBy, order } = pagination;

    const qb = this.issuerRepository
      .createQueryBuilder('issuer')
      .leftJoinAndSelect('issuer.createdBy', 'createdBy')
      .leftJoinAndSelect('issuer.documents', 'documents');

    if (search) {
      qb.where(
        'issuer.name ILIKE :search OR issuer.name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (orderBy) {
      qb.orderBy(`issuer.${orderBy}`, order as 'ASC' | 'DESC' | undefined);
    }

    return paginate(qb, pagination);
  }

  async findOne(id: string) {
    const issuer = await this.issuerRepository.findOne({
      where: { id },
      relations: ['createdBy', 'documents'],
    });
    if (!issuer) {
      throw new NotFoundException(`Issuer com id ${id} não encontrado`);
    }
    return issuer;
  }

  async update(id: string, updateIssuerDto: UpdateIssuerDto) {
    const issuer = await this.issuerRepository.preload({
      id,
      ...updateIssuerDto,
    });

    if (!issuer) {
      throw new NotFoundException(`Issuer com id ${id} não encontrado`);
    }

    return this.issuerRepository.save(issuer);
  }

  async remove(id: string) {
    const issuer = await this.findOne(id); // já lança erro se não existir
    return this.issuerRepository.remove(issuer);
  }
}
