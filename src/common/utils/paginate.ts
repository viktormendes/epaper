import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponse } from '../interfaces/pagination-response.interface';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  pagination: PaginationQueryDto,
): Promise<PaginatedResponse<T>> {
  const {
    page = 1,
    limit = 10,
  } = pagination;

  const [data, totalItems] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      prev: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
    },
  };
}
