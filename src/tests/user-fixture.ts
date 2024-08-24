import { User } from '../entities/user.entity';
import {
  I_USER_REPOSITORY,
  IUserRepository,
} from '../ports/user-repository.interface';
import { IFixture } from './fixture';
import { TestApp } from './test-app';

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
