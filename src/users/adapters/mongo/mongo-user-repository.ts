import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../ports/user-repository.interface';
import { MongoUser } from './mongo-user';

export class MongoUserRepository implements IUserRepository {
  private mapper = new UserMapper();

  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}

  async create(user: User): Promise<void> {
    const record = new this.model(this.mapper.toPersistance(user));
    await record.save();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.model.findById(id);
    return user ? this.mapper.toCore(user) : null;
  }

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = await this.model.findOne({ emailAddress });
    return user ? this.mapper.toCore(user) : null;
  }
}

class UserMapper {
  public toCore(user: MongoUser.Document): User {
    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }

  public toPersistance(user: User): MongoUser.SchemaClass {
    const { id, emailAddress, password } = user.props;
    return { _id: id, emailAddress, password };
  }
}
