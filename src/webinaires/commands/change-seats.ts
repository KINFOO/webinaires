import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../shared/domain-exeption';
import { User } from '../../users/entities/user.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { WebinaireTooManySeatsException } from '../exceptions/webinaire-too-many-seats';
import { WebinaireUpdateForbiddenException } from '../exceptions/webinaire-update-forbidden';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class ChangeSeatsCommand implements ICommand {
  constructor(
    public user: User,
    public webinaireId: string,
    public seats: number,
  ) {}
}

type Response = void;

@CommandHandler(ChangeSeatsCommand)
export class ChangeSeatsCommandHandler
  implements ICommandHandler<ChangeSeatsCommand, Response>
{
  constructor(private readonly webinaireRepository: IWebinaireRepository) {}

  async execute({
    user,
    webinaireId,
    seats,
  }: ChangeSeatsCommand): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new WebinaireNotFoundException();
    } else if (webinaire.props.seats > seats) {
      throw new DomainException('Seats upgrade only');
    } else if (!webinaire.isOrganiser(user)) {
      throw new WebinaireUpdateForbiddenException();
    }

    webinaire.update({ seats });

    if (webinaire.hasTooManySeats()) {
      throw new WebinaireTooManySeatsException();
    }
    await this.webinaireRepository.update(webinaire);
  }
}
