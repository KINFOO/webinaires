import { IMailer } from '../../core/ports/mailer.interface';
import { DomainException } from '../../shared/domain-exeption';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireFullException } from '../exceptions/webinaire-full';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;
export class ReserveSeats implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ user, webinaireId }: Request): Promise<void> {
    const userId = user.props.id;
    const participation = new Participation({ webinaireId, userId });
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    await Promise.all([
      this.assertUserNotParticipating(user, webinaireId),
      this.assertHasEnoughSeats(webinaire),
    ]);

    await this.participationRepository.create(participation);
    await this.sendEmailToOrganizer(webinaire);
    await this.sendEmailToParticipant(
      user.props.emailAddress,
      webinaire.props.title,
    );
  }

  private async sendEmailToOrganizer(webinaire: Webinaire) {
    const { organizerId, title } = webinaire.props;
    const organizer = await this.userRepository.findById(organizerId);
    if (!organizer) {
      return;
    }

    await this.mailer.send({
      to: organizer.props.emailAddress,
      subject: 'New participation',
      body: `New reservation for "${title}"`,
    });
  }

  private async sendEmailToParticipant(
    participantEmail: string,
    webinaireTitle: string,
  ) {
    await this.mailer.send({
      to: participantEmail,
      subject: 'Participation accepted',
      body: `Your participation to "${webinaireTitle}" has been accepted`,
    });
  }

  private async assertHasEnoughSeats(webinaire: Webinaire) {
    const participationCount = await this.participationRepository.count(
      webinaire.props.id,
    );
    if (participationCount >= webinaire.props.seats) {
      throw new WebinaireFullException();
    }
  }

  private async assertUserNotParticipating(user: User, webinaireId: string) {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinaireId,
    );
    if (existingParticipation) {
      throw new DomainException("You're already attending this webinaire");
    }
  }
}
