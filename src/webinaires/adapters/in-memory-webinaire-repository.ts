import { Webinaire } from '../entities/webinaire.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  constructor(public database: Webinaire[] = []) {}

  async create(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }

  async update(webinaire: Webinaire): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinaire.props.id,
    );
    if (index === -1) {
      throw new Error('Webinaire to update not found');
    }
    webinaire.commit();
    this.database[index] = webinaire;
  }

  findByIdSync(id: string): Webinaire | null {
    const webinaire = this.database.find((w) => w.props.id === id);
    return webinaire ? new Webinaire({ ...webinaire.initialState }) : null;
  }

  async findById(id: string): Promise<Webinaire | null> {
    return this.findByIdSync(id);
  }
}
