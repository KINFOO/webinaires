import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../ports/user-repository.interface';
import { MongoUser } from './mongo-user';

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}

  async create(user: User): Promise<void> {
    const { id, emailAddress, password } = user.props;
    const record = new this.model({ _id: id, emailAddress, password });
    await record.save();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.model.findById(id);
    if (!user) {
      return null;
    }

    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = await this.model.findOne({ emailAddress });
    if (!user) {
      return null;
    }

    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }
}
