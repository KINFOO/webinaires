import { Webinaire } from '../entities/webinaire.entity';

export const testWebinaires = {
  cqrs: new Webinaire({
    id: 'cqrs-id',
    organizerId: 'bob@gmail.com',
    title: 'CQRS',
    seats: 42,
    startDate: new Date('2023-01-20T10:00:00.000Z'),
    endDate: new Date('2023-01-21T11:00:00.000Z'),
  }),
  masterClass: new Webinaire({
    id: 'master-class-id',
    organizerId: 'alice@gmail.com',
    title: 'Master Class',
    seats: 12,
    startDate: new Date('2023-01-20T10:00:00.000Z'),
    endDate: new Date('2023-01-21T11:00:00.000Z'),
  }),
};
