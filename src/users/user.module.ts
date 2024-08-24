import { Module } from '@nestjs/common';

import { CommonModule } from '../core/common.module';
import { InMemoryUserRepository } from './adapters/in-memory-user-repository';
import { I_USER_REPOSITORY } from './ports/user-repository.interface';

@Module({
  imports: [CommonModule],
  providers: [
    {
      provide: I_USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [I_USER_REPOSITORY],
})
export class UserModule {}
