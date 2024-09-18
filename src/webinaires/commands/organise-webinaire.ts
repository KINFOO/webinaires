import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IIDGenerator } from '../../core/ports/id-generator.interface';
import { User } from '../../users/entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotEnoughSeatsException } from '../exceptions/webinaire-not-enough-seats';
import { WebinaireTooEarlyException } from '../exceptions/webinaire-too-early';
import { WebinaireTooManySeatsException } from '../exceptions/webinaire-too-many-seats';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class OrganizeWebinaireCommand implements ICommand {
  constructor(
    public title: string,
    public startDate: Date,
    public endDate: Date,
    public seats: number,
    public user: User,
  ) {}
}

type Response = { id: string };

@CommandHandler(OrganizeWebinaireCommand)
export class OrganizeWebinaireCommandHandler
  implements ICommandHandler<OrganizeWebinaireCommand, Response>
{
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGeneraror: IDateGenerator,
  ) {}

  async execute(data: OrganizeWebinaireCommand) {
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

    await this.repository.create(webinaire);

    return { id };
  }
}
