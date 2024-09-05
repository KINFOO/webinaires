import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { WebinaireUpdateForbiddenException } from '../exceptions/webinaire-update-forbidden';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;
export class CancelWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ user, webinaireId }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new WebinaireNotFoundException();
    } else if (!webinaire.isOrganiser(user)) {
      throw new WebinaireUpdateForbiddenException();
    }

    await this.webinaireRepository.delete(webinaire);

    await this.sendCancelations(webinaire);
  }

  private async sendCancelations(webinaire: Webinaire) {
    const { id, title } = webinaire.props;
    const participations =
      await this.participationRepository.findByWebinaireId(id);

    const participants = await Promise.all(
      participations.map((p) => this.userRepository.findById(p.props.userId)),
    );

    const mailPromises = participants
      .filter((participant) => participant !== null)
      .map((participant) =>
        this.mailer.send({
          to: participant!.props.emailAddress,
          subject: 'Webinaire canceled',
          body: `Webinaire "${title}" has been canceled`,
        }),
      );

    await Promise.all(mailPromises);
  }
}
