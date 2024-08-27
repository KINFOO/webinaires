import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  constructor(public database: Webinaire[] = []) {}

  async create(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }

  async update(webinaire: Webinaire): Promise<void> {
    const index = this.findIndex(webinaire);
    if (index === -1) {
      throw new WebinaireNotFoundException();
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

  async delete(webinaire: Webinaire): Promise<void> {
    const index = this.findIndex(webinaire);
    if (index === -1) {
      throw new WebinaireNotFoundException();
    }
    this.database.splice(index, 1);
  }

  private findIndex(webinaire: Webinaire): number {
    return this.database.findIndex((w) => w.props.id === webinaire.props.id);
  }
}
