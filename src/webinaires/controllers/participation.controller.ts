import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../users/entities/user.entity';
import { CancelSeats } from '../commands/cancel-seats';
import { ReserveSeatsCommand } from '../commands/reserve-seats';
import { WebinaireAPI } from '../contracts';

@Controller()
export class ParticipationController {
  constructor(
    private readonly cancelSeats: CancelSeats,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/webinaires/:id/participations')
  async handleParticipateTolWebinaire(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ReserveSeats.Response> {
    return this.commandBus.execute(new ReserveSeatsCommand(request.user, id));
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
