import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_MAILER } from '../core/ports/mailer.interface';
import { MongoUser } from '../users/adapters/mongo/mongo-user';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { UserModule } from '../users/user.module';
import { MongoParticipation } from './adapters/mongo/mongo-participation';
import { MongoParticipationRepository } from './adapters/mongo/mongo-participation-repository';
import { MongoWebinaire } from './adapters/mongo/mongo-webinaire';
import { MongoWebinaireRepository } from './adapters/mongo/mongo-webinaire-repository';
import { CancelSeats } from './commands/cancel-seats';
import { CancelWebinaire } from './commands/cancel-webinaire';
import { ChangeDates } from './commands/change-dates';
import { ChangeSeats } from './commands/change-seats';
import { OrganizeWebinaire } from './commands/organise-webinaire';
import { ReserveSeatsCommandHandler } from './commands/reserve-seats';
import { ParticipationController } from './controllers/participation.controller';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation-repository.interface';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { GetWebinaireByIdQueryHandler } from './queries/get-webinaire-by-id';

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: MongoParticipation.CollectionName,
        schema: MongoParticipation.Schema,
      },
      { name: MongoWebinaire.CollectionName, schema: MongoWebinaire.Schema },
    ]),
  ],
  controllers: [ParticipationController, WebinaireController],
  exports: [I_PARTICIPATION_REPOSITORY, I_WEBINAIRE_REPOSITORY],
  providers: [
    {
      provide: I_PARTICIPATION_REPOSITORY,
      inject: [getModelToken(MongoParticipation.CollectionName)],
      useFactory: (model) => new MongoParticipationRepository(model),
    },
    {
      provide: I_WEBINAIRE_REPOSITORY,
      inject: [getModelToken(MongoWebinaire.CollectionName)],
      useFactory: (model) => new MongoWebinaireRepository(model),
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
      provide: ReserveSeatsCommandHandler,
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
        return new ReserveSeatsCommandHandler(
          participationRepository,
          userRepository,
          webinaireRepository,
          mailer,
        );
      },
    },
    {
      provide: CancelSeats,
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
        return new CancelSeats(
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
    {
      provide: GetWebinaireByIdQueryHandler,
      inject: [
        getModelToken(MongoParticipation.CollectionName),
        getModelToken(MongoUser.CollectionName),
        getModelToken(MongoWebinaire.CollectionName),
      ],
      useFactory: (participationModel, userModel, webinaireModel) => {
        return new GetWebinaireByIdQueryHandler(
          participationModel,
          userModel,
          webinaireModel,
        );
      },
    },
  ],
})
export class WebinaireModule {}
