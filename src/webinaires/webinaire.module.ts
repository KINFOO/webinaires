import { Module } from '@nestjs/common';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { InMemoryWebinaireRepository } from './adapters/in-memory-webinaire-repository';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { OrganizeWebinaire } from './usecases/organise-webinaire';

@Module({
  imports: [CommonModule],
  controllers: [WebinaireController],
  exports: [I_WEBINAIRE_REPOSITORY],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useClass: InMemoryWebinaireRepository,
    },
    {
      provide: OrganizeWebinaire,
      inject: [I_DATE_GENERATOR, I_ID_GENERATOR, I_WEBINAIRE_REPOSITORY],
      useFactory: (dateGenerator, idGenerator, repository) => {
        return new OrganizeWebinaire(repository, idGenerator, dateGenerator);
      },
    },
  ],
})
export class WebinaireModule {}
