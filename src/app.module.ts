import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './models/user/user.module';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { AuthModule } from './authentication/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PostgresConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}