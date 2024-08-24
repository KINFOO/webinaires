import { User } from '../entities/user.entity';

export const I_USER_REPOSITORY = 'I_USER_REPOSITORY';

export interface IUserRepository {
  create(user: User): Promise<void>;
  findByEmailAddress(emailAddress: string): Promise<User | null>;
}
