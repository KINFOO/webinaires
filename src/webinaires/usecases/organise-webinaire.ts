import { User } from '../../users/entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IIDGenerator } from '../../core/ports/id-generator.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class OrganizeWebinaire {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGeneraror: IDateGenerator,
  ) {}

  async execute(data: {
    title: string;
    startDate: Date;
    endDate: Date;
    seats: number;
    user: User;
  }) {
    const id = this.idGenerator.generate();
    const { title, seats, startDate, endDate, user } = data;
    const webinaire = new Webinaire({
      id,
      title,
      seats,
      startDate,
      endDate,
      organizerId: user.props.id,
    });

    if (webinaire.isTooClose(this.dateGeneraror.now())) {
      throw new Error('The webinaire must happen in least 3 days');
    } else if (webinaire.hasTooManySeats()) {
      throw new Error('The webinaire must have a maximum of 1500 seats');
    } else if (!webinaire.hasSeats()) {
      throw new Error('The webinaire must have seats');
    }

    this.repository.create(webinaire);

    return { id };
  }
}
