import { Webinaire } from '../../webinaires/entities/webinaire.entity';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../../webinaires/ports/webinaire-repository.interface';
import { IFixture } from '../utils/fixture.interface';
import { TestApp } from '../utils/test-app';

export class WebinaireFixture implements IFixture {
  constructor(public readonly entity: Webinaire) {}
  async load(app: TestApp) {
    const repository = app.get<IWebinaireRepository>(I_WEBINAIRE_REPOSITORY);
    await repository.create(this.entity);
  }
}
