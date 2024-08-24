import { Body, Controller, Post, Request } from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contracts';
import { OrganizeWebinaire } from '../usecases/organise-webinaire';

@Controller()
export class WebinaireController {
  constructor(private readonly organizeWebinaire: OrganizeWebinaire) {}

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
}
