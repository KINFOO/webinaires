import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public database: Participation[] = []) {}

  async count(webinaireId: string): Promise<number> {
    return this.database.filter((p) => p.props.webinaireId === webinaireId)
      .length;
  }

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  async findOne(
    userId: string,
    webinaireId: string,
  ): Promise<Participation | null> {
    const participation = this.database.find(
      (p) => p.props.webinaireId === webinaireId && p.props.userId === userId,
    );
    return participation ?? null;
  }

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinaireId === webinaireId);
  }
}
