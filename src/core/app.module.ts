import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { Authenticator } from '../users/services/authenticator';
import { UserModule } from '../users/user.module';
import { WebinaireModule } from '../webinaires/webinaire.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGard } from './auth.gard';
import { CommonModule } from './common.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL'),
      }),
    }),
    CommonModule,
    UserModule,
    WebinaireModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: Authenticator,
      inject: [I_USER_REPOSITORY],
      useFactory: (repository) => {
        return new Authenticator(repository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGard(authenticator);
      },
    },
  ],
  exports: [],
})
export class AppModule {}
