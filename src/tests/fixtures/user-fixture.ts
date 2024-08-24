import { User } from '../../users/entities/user.entity';
import {
  I_USER_REPOSITORY,
  IUserRepository,
} from '../../users/ports/user-repository.interface';
import { IFixture } from '../utils/fixture.interface';
import { TestApp } from '../utils/test-app';

export class UserFixture implements IFixture {
  constructor(public readonly entity: User) {}
  async load(app: TestApp) {
    const repository = app.get<IUserRepository>(I_USER_REPOSITORY);
    await repository.create(this.entity);
  }
  createBasicAuthorizationToken() {
    const { emailAddress: email, password } = this.entity.props;
    return 'Basic ' + Buffer.from(`${email}:${password}`).toString('base64');
  }
}
