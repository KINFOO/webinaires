import { Participation } from '../entities/participation.entity';

export const I_PARTICIPATION_REPOSITORY = 'I_PARTICIPATION_REPOSITORY';

export interface IParticipationRepository {
  count(webinaireId: string): Promise<number>;
  create(participation: Participation): Promise<void>;
  delete(participation: Participation): Promise<void>;
  findByWebinaireId(webinaireId: string): Promise<Participation[]>;
  findOne(userId: string, webinaireId: string): Promise<Participation | null>;
}
