import { addDays } from 'date-fns';
import { Webinaire } from '../../webinaires/entities/webinaire.entity';
import { WebinaireFixture } from '../fixtures/webinaire-fixture';
import { e2eUsers } from './user-seeds.e2e';

export const e2eWebinaires = {
  timeOfChange: new WebinaireFixture(
    new Webinaire({
      id: 'id-1',
      organizerId: e2eUsers.johnDoe.entity.props.id,
      seats: 50,
      title: 'Time of change',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 5),
    }),
  ),
};
