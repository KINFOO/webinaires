import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contracts';
import { CancelSeats } from '../usecases/cancel-seats';
import { ReserveSeats } from '../usecases/reserve-seats';

@Controller()
export class ParticipationController {
  constructor(
    private readonly cancelSeats: CancelSeats,
    private readonly reserveSeats: ReserveSeats,
  ) {}

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

  @Delete('/webinaires/:id/participations')
  async handleCancelParticipationTolWebinaire(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.CancelSeats.Response> {
    return this.cancelSeats.execute({
      user: request.user,
      webinaireId: id,
    });
  }
}
