import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { OrganizeWebinaire } from '../usecases/organise-webinaire';
import { AppService } from './app.service';
import { WebinaireAPI } from './contracts';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly organizeWebinaire: OrganizeWebinaire,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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
