import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IMailer } from '../../core/ports/mailer.interface';
import { DomainException } from '../../shared/domain-exeption';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class CancelSeatsCommand implements ICommand {
  constructor(
    public user: User,
    public webinaireId: string,
  ) {}
}

type Response = void;

@CommandHandler(CancelSeatsCommand)
export class CancelSeatsCommandHandler
  implements ICommandHandler<CancelSeatsCommand, Response>
{
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ user, webinaireId }: CancelSeatsCommand): Promise<void> {
    const userId = user.props.id;
    const [webinaire, participation] = await Promise.all([
      this.webinaireRepository.findById(webinaireId),
      this.participationRepository.findOne(userId, webinaireId),
    ]);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    if (!participation) {
      throw new DomainException('You were not attending this webinaire');
    }

    await this.participationRepository.delete(participation);

    await Promise.all([
      this.sendEmailToOrganizer(webinaire),
      this.sendEmailToParticipant(userId, webinaire),
    ]);
  }

  private async sendEmailToOrganizer({
    props: { organizerId, title },
  }: Webinaire) {
    const origanizer = await this.userRepository.findById(organizerId);
    if (!origanizer) {
      return;
    }

    await this.mailer.send({
      to: origanizer.props.emailAddress,
      subject: 'Participation canceled',
      body: `${origanizer.props.emailAddress} dropped reservation for "${title}"`,
    });
  }

  private async sendEmailToParticipant(userId: string, webinaire) {
    const participant = await this.userRepository.findById(userId);
    if (!participant) {
      return;
    }

    await this.mailer.send({
      to: participant.props.emailAddress,
      subject: 'Participation canceled',
      body: `Your participation to "${webinaire.props.title}" has been canceled`,
    });
  }
}
