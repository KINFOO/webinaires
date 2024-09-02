import { Participation } from '../../webinaires/entities/participation.entity';
import { ParticipationFixture } from '../fixtures/participation-fixture';

export const e2eParticipations = {
  timeOfChangeParticipation: new ParticipationFixture(
    new Participation({
      userId: 'bob',
      webinaireId: 'id-1',
    }),
  ),
};
