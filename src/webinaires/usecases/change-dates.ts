import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  startDate: Date;
  endDate: Date;
  user: User;
  webinaireId: string;
};

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly dateGenerator: IDateGenerator,
    private readonly mailer: IMailer,
  ) {}
  async execute({
    user,
    webinaireId,
    startDate,
    endDate,
  }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new Error('Webinaire not found');
    } else if (webinaire.props.organizerId !== user.props.id) {
      throw new Error('Dates update is restricted to organizer');
    }

    webinaire.update({ startDate, endDate });

    if (webinaire.isTooClose(this.dateGenerator.now())) {
      throw new Error('The webinaire must happen in least 3 days');
    }

    await this.webinaireRepository.update(webinaire);
    await this.sendEmailToParticipants(webinaire);
  }

  async sendEmailToParticipants(webinaire: Webinaire): Promise<void> {
    const participations = await this.participationRepository.findByWebinaireId(
      webinaire.props.id,
    );

    const users = await Promise.all(
      participations.map((participation) =>
        this.userRepository.findById(participation.props.userId),
      ),
    );

    const validUsers = users.filter((user) => !!user);
    const { title, startDate, endDate } = webinaire.props;
    const mailPromises = validUsers.map((user) =>
      this.mailer.send({
        to: user.props.emailAddress,
        subject: `The dates of "${title}" have changed`,
        body: `New dates are ${startDate.toISOString()} - ${endDate.toISOString()}`,
      }),
    );

    await Promise.all(mailPromises);
  }
}
