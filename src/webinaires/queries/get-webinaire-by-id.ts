import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { MongoUser } from '../../users/adapters/mongo/mongo-user';
import { MongoParticipation } from '../adapters/mongo/mongo-participation';
import { MongoWebinaire } from '../adapters/mongo/mongo-webinaire';
import { WebinaireDTO } from '../dto/webinaire.dto';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';

export class GetWebinaireByIdQuery implements IQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetWebinaireByIdQuery)
export class GetWebinaireByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
    private readonly webinaireModel: Model<MongoWebinaire.SchemaClass>,
  ) {}

  async execute({ id }: GetWebinaireByIdQuery): Promise<WebinaireDTO> {
    const [participationCount, webinaire] = await Promise.all([
      this.participationModel.countDocuments({ _id: id }),
      this.webinaireModel.findById(id),
    ]);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    const organizer = await this.userModel.findById(webinaire.organizerId);
    if (!organizer) {
      throw new Error('Organizer not found');
    }

    return {
      id: webinaire._id,
      title: webinaire.title,
      startDate: webinaire.startDate,
      endDate: webinaire.endDate,
      organizer: { id: organizer._id, emailAddress: organizer.emailAddress },
      seats: {
        available: webinaire.seats - participationCount,
        reserved: participationCount,
      },
    };
  }
}
