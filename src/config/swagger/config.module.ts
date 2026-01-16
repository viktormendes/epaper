import { INestApplication, Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './configuration';

@Module({})
export class SwaggerModuleConfig {
  static setup(app: INestApplication<any>): void {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document, {
      swaggerOptions: {
        requestInterceptor: (request) => {
          if (request.headers && request.headers.Authorization) {
            const token = request.headers.Authorization;
            if (!token.startsWith('Bearer ')) {
              request.headers.Authorization = `Bearer ${token}`;
            }
          }
          return request;
        },
      },
    });
  }
}
