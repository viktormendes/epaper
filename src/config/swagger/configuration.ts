import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
      .setTitle('E-Paper API')
      .setDescription('API para autenticação e gerenciamento de e-papers')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }, 'JWT-auth')
      .build();
