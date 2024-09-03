import * as deepObjectDiff from 'deep-object-diff';
import { Model } from 'mongoose';
import { Webinaire } from '../../entities/webinaire.entity';
import { IWebinaireRepository } from '../../ports/webinaire-repository.interface';
import { MongoWebinaire } from './mongo-webinaire';

export class MongoWebinaireRepository implements IWebinaireRepository {
  private mapper = new WebinaireMapper();

  constructor(private readonly model: Model<MongoWebinaire.SchemaClass>) {}

  async create(webinaire: Webinaire): Promise<void> {
    const record = new this.model(this.mapper.toPersistance(webinaire));
    await record.save();
  }

  async findById(id: string): Promise<Webinaire | null> {
    const webinaire = await this.model.findById(id);
    return webinaire ? this.mapper.toCore(webinaire) : null;
  }

  async update(webinaire: Webinaire): Promise<void> {
    const record = await this.model.findById(webinaire.props.id);
    if (!record) {
      return;
    }
    const diff = deepObjectDiff.diff(webinaire.initialState, webinaire.props);
    await record.updateOne(diff);
    webinaire.commit();
  }

  async delete(webinaire: Webinaire): Promise<void> {
    await this.model.findByIdAndDelete(webinaire.props.id);
  }
}

class WebinaireMapper {
  public toCore(webinaire: MongoWebinaire.Document): Webinaire {
    const { _id, title, organizerId, startDate, endDate, seats } = webinaire;
    return new Webinaire({
      id: _id,
      title,
      organizerId,
      startDate,
      endDate,
      seats,
    });
  }

  public toPersistance(webinaire: Webinaire): MongoWebinaire.SchemaClass {
    return { _id: webinaire.props.id, ...webinaire.props };
  }
}
