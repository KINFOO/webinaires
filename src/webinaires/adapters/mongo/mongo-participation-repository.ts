import { Model } from 'mongoose';
import { Participation } from '../../entities/participation.entity';
import { IParticipationRepository } from '../../ports/participation-repository.interface';
import { MongoParticipation } from './mongo-participation';

export class MongoParticipationRepository implements IParticipationRepository {
  private mapper = new ParticipationMapper();

  constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {}
  async count(webinaireId: string): Promise<number> {
    return this.model.countDocuments({ webinaireId });
  }

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    const participations = await this.model.find({ webinaireId });
    return participations.map((p) => this.mapper.toCore(p));
  }

  async findOne(
    userId: string,
    webinaireId: string,
  ): Promise<Participation | null> {
    const participation = await this.model.findOne({ userId, webinaireId });
    return participation ? this.mapper.toCore(participation) : null;
  }

  async create(participation: Participation): Promise<void> {
    const record = new this.model(this.mapper.toPersistance(participation));
    await record.save();
  }

  async delete(participation: Participation): Promise<void> {
    const id = MongoParticipation.SchemaClass.makeId(participation);
    await this.model.findByIdAndDelete(id);
  }
}

class ParticipationMapper {
  public toCore(participation: MongoParticipation.Document): Participation {
    const { userId, webinaireId } = participation;
    return new Participation({ userId, webinaireId });
  }

  public toPersistance(
    participation: Participation,
  ): MongoParticipation.SchemaClass {
    const _id = MongoParticipation.SchemaClass.makeId(participation);
    return { _id, ...participation.props };
  }
}
