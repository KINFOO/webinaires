import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IIDGenerator } from '../../core/ports/id-generator.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotEnoughSeatsException } from '../exceptions/webinaire-not-enough-seats';
import { WebinaireTooEarlyException } from '../exceptions/webinaire-too-early';
import { WebinaireTooManySeatsException } from '../exceptions/webinaire-too-many-seats';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  title: string;
  startDate: Date;
  endDate: Date;
  seats: number;
  user: User;
};

type Response = { id: string };
export class OrganizeWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGeneraror: IDateGenerator,
  ) {}

  async execute(data: Request) {
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
      throw new WebinaireTooEarlyException();
    } else if (webinaire.hasTooManySeats()) {
      throw new WebinaireTooManySeatsException();
    } else if (!webinaire.hasSeats()) {
      throw new WebinaireNotEnoughSeatsException();
    }

    this.repository.create(webinaire);

    return { id };
  }
}
