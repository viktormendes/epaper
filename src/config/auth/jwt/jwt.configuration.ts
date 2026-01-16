import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }

  return {
    secret,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRE_IN ? 
        parseInt(process.env.JWT_EXPIRE_IN, 10) : 
        3600,
    },
  } as JwtModuleOptions;
});