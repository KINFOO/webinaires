import { Participation } from '../../webinaires/entities/participation.entity';
import {
  I_PARTICIPATION_REPOSITORY,
  IParticipationRepository,
} from '../../webinaires/ports/participation-repository.interface';
import { IFixture } from '../utils/fixture.interface';
import { TestApp } from '../utils/test-app';

export class ParticipationFixture implements IFixture {
  constructor(public readonly entity: Participation) {}
  async load(app: TestApp) {
    const repository = app.get<IParticipationRepository>(
      I_PARTICIPATION_REPOSITORY,
    );
    await repository.create(this.entity);
  }
}
