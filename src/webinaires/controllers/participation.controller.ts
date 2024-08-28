import { Controller, Param, Post, Request } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contracts';
import { ReserveSeats } from '../usecases/reserve-seats';

@Controller()
export class ParticipationController {
  constructor(private readonly reserveSeats: ReserveSeats) {}

  @Post('/webinaires/:id/participations')
  async handleParticipateTolWebinaire(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ReserveSeats.Response> {
    return this.reserveSeats.execute({
      user: request.user,
      webinaireId: id,
    });
  }
}
