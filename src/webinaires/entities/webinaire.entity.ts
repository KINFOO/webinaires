import { differenceInDays } from 'date-fns';

type WebinaireProps = {
  id: string;
  organizerId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire {
  public initialState: WebinaireProps;
  public props: WebinaireProps;

  constructor(data: WebinaireProps) {
    this.props = { ...data };
    this.initialState = { ...data };
    Object.freeze(this.initialState);
  }

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

  upgradeSeats(seats: number, organizerId: string) {
    if (this.props.seats > seats) {
      throw new Error('Seats upgrade only');
    } else if (organizerId !== this.props.organizerId) {
      throw new Error('Seats update is restricted to organizer');
    }

    this.update({ seats });

    if (this.hasTooManySeats()) {
      throw new Error('The webinaire must have a maximum of 1500 seats');
    }
  }

  update(data: Partial<WebinaireProps>): void {
    this.props = { ...this.props, ...data };
  }

  commit(): void {
    this.initialState = this.props;
  }
}
