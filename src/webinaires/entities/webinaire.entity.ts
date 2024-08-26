import { differenceInDays } from 'date-fns';
import { Entity } from '../../shared/entity';

type WebinaireProps = {
  id: string;
  organizerId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire extends Entity<WebinaireProps> {
  isTooClose(now: Date): boolean {
    const diff = differenceInDays(this.props.startDate, now);
    return diff < 3;
  }

  hasTooManySeats() {
    return this.props.seats > 1000;
  }

  hasSeats() {
    return this.props.seats > 0;
  }
}
