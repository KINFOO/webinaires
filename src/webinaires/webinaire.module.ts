import { Module } from '@nestjs/common';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_MAILER } from '../core/ports/mailer.interface';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { UserModule } from '../users/user.module';
import { InMemoryParticipationRepository } from './adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from './adapters/in-memory-webinaire-repository';
import { ParticipationController } from './controllers/participation.controller';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation-repository.interface';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { CancelWebinaire } from './usecases/cancel-webinaire';
import { ChangeDates } from './usecases/change-dates';
import { ChangeSeats } from './usecases/change-seats';
import { OrganizeWebinaire } from './usecases/organise-webinaire';
import { ReserveSeats } from './usecases/reserve-seats';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [ParticipationController, WebinaireController],
  exports: [I_PARTICIPATION_REPOSITORY, I_WEBINAIRE_REPOSITORY],
  providers: [
    {
      provide: I_PARTICIPATION_REPOSITORY,
      useClass: InMemoryParticipationRepository,
    },
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
    {
      provide: ChangeDates,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_WEBINAIRE_REPOSITORY,
        I_DATE_GENERATOR,
        I_MAILER,
      ],
      useFactory: (
        participationRepository,
        userRepository,
        webinaireRepository,
        dateGeneraror,
        mailer,
      ) => {
        return new ChangeDates(
          participationRepository,
          userRepository,
          webinaireRepository,
          dateGeneraror,
          mailer,
        );
      },
    },
    {
      provide: ReserveSeats,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_WEBINAIRE_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        participationRepository,
        userRepository,
        webinaireRepository,

        mailer,
      ) => {
        return new ReserveSeats(
          participationRepository,
          userRepository,
          webinaireRepository,

          mailer,
        );
      },
    },
    {
      provide: CancelWebinaire,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinaireRepository,
        participationRepository,
        userRepository,
        mailer,
      ) => {
        return new CancelWebinaire(
          webinaireRepository,
          participationRepository,
          userRepository,
          mailer,
        );
      },
    },
    {
      provide: ChangeSeats,
      inject: [I_WEBINAIRE_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeats(repository);
      },
    },
  ],
})
export class WebinaireModule {}
