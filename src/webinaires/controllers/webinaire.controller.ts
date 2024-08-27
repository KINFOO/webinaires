import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contracts';
import { CancelWebinaire } from '../usecases/cancel-webinaire';
import { ChangeDates } from '../usecases/change-dates';
import { ChangeSeats } from '../usecases/change-seats';
import { OrganizeWebinaire } from '../usecases/organise-webinaire';

@Controller()
export class WebinaireController {
  constructor(
    private readonly changeDates: ChangeDates,
    private readonly changeSeats: ChangeSeats,
    private readonly cancelWebinaire: CancelWebinaire,
    private readonly organizeWebinaire: OrganizeWebinaire,
  ) {}

  @Post('/webinaires')
  async handleOrganizeWebinaire(
    @Body(new ZodValidationPipe(WebinaireAPI.OrganizeWebinaire.schema))
    body: WebinaireAPI.OrganizeWebinaire.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.OrganizeWebinaire.Response> {
    const { title, seats, startDate, endDate } = body;
    return this.organizeWebinaire.execute({
      user: request.user,
      title,
      seats,
      startDate,
      endDate,
    });
  }

  @HttpCode(200)
  @Post('/webinaires/:id/seats')
  async handleChangeSeats(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinaireAPI.ChangeSeats.schema))
    body: WebinaireAPI.ChangeSeats.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: request.user,
      webinaireId: id,
      seats: body.seats,
    });
  }

  @HttpCode(200)
  @Post('/webinaires/:id/dates')
  async handleChangeDates(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinaireAPI.ChangeDates.schema))
    body: WebinaireAPI.ChangeDates.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ChangeDates.Response> {
    const { endDate, startDate } = body;
    return this.changeDates.execute({
      user: request.user,
      webinaireId: id,
      endDate,
      startDate,
    });
  }

  @HttpCode(200)
  @Delete('/webinaires/:id')
  async handleCancelWebinaire(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ChangeDates.Response> {
    return this.cancelWebinaire.execute({
      user: request.user,
      webinaireId: id,
    });
  }
}
