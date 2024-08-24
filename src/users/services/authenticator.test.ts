import { InMemoryUserRepository } from 'src/users/adapters/in-memory-user-repository';
import { User } from 'src/users/entities/user.entity';
import { Authenticator } from './authenticator';

describe('Authenticator', () => {
  let authenticator;
  let repository;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
    authenticator = new Authenticator(repository);
    await repository.create(
      new User({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      }),
    );
  });

  describe('Case: the token is valid', () => {
    it('should return the user', async () => {
      const payload = Buffer.from('johndoe@gmail.com:azerty', 'utf-8').toString(
        'base64',
      );

      const user = await authenticator.authenticate(payload);

      expect(user.props).toEqual({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      });
    });
  });

  describe('Case: user does not exist', () => {
    it('should fail', async () => {
      const payload = Buffer.from('nope@gmail.com:azerty', 'utf-8').toString(
        'base64',
      );

      expect(() => authenticator.authenticate(payload)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('Case: password is invalid', () => {
    it('should fail', async () => {
      const payload = Buffer.from(
        'johndoe@gmail.com:invalid',
        'utf-8',
      ).toString('base64');

      expect(() => authenticator.authenticate(payload)).rejects.toThrow(
        'Password invalid',
      );
    });
  });
});
