import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public database: Participation[] = []) {}

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinaireId === webinaireId);
  }
}
