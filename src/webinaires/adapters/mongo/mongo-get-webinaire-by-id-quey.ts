import { Model } from 'mongoose';
import { MongoUser } from '../../../users/adapters/mongo/mongo-user';
import { WebinaireDTO } from '../../dto/webinaire.dto';
import { WebinaireNotFoundException } from '../../exceptions/webinaire-not-found';
import { IGetWebinaireByIdQuery } from '../../ports/get-webinaire-by-id.interface';
import { MongoParticipation } from './mongo-participation';
import { MongoWebinaire } from './mongo-webinaire';

export class MongoGetWebinaireById implements IGetWebinaireByIdQuery {
  constructor(
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
    private readonly webinaireModel: Model<MongoWebinaire.SchemaClass>,
  ) {}

  async execute(id: string): Promise<WebinaireDTO> {
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
