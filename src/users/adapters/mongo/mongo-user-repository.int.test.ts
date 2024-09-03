import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { User } from '../../entities/user.entity';
import { testUsers } from '../../tests/user-seeds';
import { MongoUser } from './mongo-user';
import { MongoUserRepository } from './mongo-user-repository';

describe('MongoUserRepository', () => {
  async function createUserInDatabase(user: User) {
    const { id, emailAddress, password } = user.props;
    const record = new model({ _id: id, emailAddress, password });
    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoUser.SchemaClass>;
  let repository: MongoUserRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    const token = getModelToken(MongoUser.CollectionName);
    model = app.get<Model<MongoUser.SchemaClass>>(token);
    repository = new MongoUserRepository(model);

    await model.deleteMany();
    await createUserInDatabase(testUsers.alice);
  });

  describe('findByEmailAddress', () => {
    it('should find user with this email address', async () => {
      const { emailAddress } = testUsers.alice.props;
      const user = await repository.findByEmailAddress(emailAddress);

      expect(user).not.toBeNull();
      expect(user?.props).toEqual(testUsers.alice.props);
    });

    it('should fail with unknown email address', async () => {
      const emailAddress = 'does-not-exist@voila.fr';
      const user = await repository.findByEmailAddress(emailAddress);

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user for this id', async () => {
      const { id } = testUsers.alice.props;
      const user = await repository.findById(id);

      expect(user).not.toBeNull();
      expect(user?.props).toEqual(testUsers.alice.props);
    });

    it('should fail with unknown id', async () => {
      const id = 'does-not-exist';
      const user = await repository.findById(id);

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create', async () => {
      await repository.create(testUsers.bob);

      const record = await model.findById(testUsers.bob.props.id);

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: testUsers.bob.props.id,
        emailAddress: testUsers.bob.props.emailAddress,
        password: testUsers.bob.props.password,
      });
    });
  });

  afterEach(async () => await app.cleanup());
});
