import { User } from '../../users/entities/user.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
  seats: number;
};

type Response = void;

export class ChangeSeats {
  constructor(private readonly webinaireRepository: IWebinaireRepository) {}

  async execute({ user, webinaireId, seats }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new Error('Webinaire not found');
    } else if (webinaire.props.seats > seats) {
      throw new Error('Seats upgrade only');
    } else if (webinaire.props.organizerId !== user.props.id) {
      throw new Error('Seats update is restricted to organizer');
    }

    webinaire.update({ seats });

    if (webinaire.hasTooManySeats()) {
      throw new Error('The webinaire must have a maximum of 1500 seats');
    }
    await this.webinaireRepository.update(webinaire);
  }
}
