import type { Request } from 'express';
import { User } from '@/models/user/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}
