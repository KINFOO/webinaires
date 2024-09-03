import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AppModule } from '../../core/app.module';
import { MongoUser } from '../../users/adapters/mongo/mongo-user';
import { MongoParticipation } from '../../webinaires/adapters/mongo/mongo-participation';
import { MongoWebinaire } from '../../webinaires/adapters/mongo/mongo-webinaire';
import { IFixture } from './fixture.interface';

export class TestApp {
  private app: INestApplication;

  async setup() {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              DATABASE_URL:
                'mongodb://admin:azerty@localhost:3701/webinaires?authSource=admin&directConnection=true',
            }),
          ],
        }),
      ],
    }).compile();

    this.app = module.createNestApplication();
    await this.app.init();
    await this.clearDatabase();
  }

  async cleanup() {
    await this.app?.close();
  }

  async loadFixtures(fixtures: IFixture[]) {
    await Promise.all(fixtures.map((fixture) => fixture.load(this)));
  }

  get<T>(name: any) {
    return this.app.get<T>(name);
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  private async clearDatabase() {
    const userModelToken = getModelToken(MongoUser.CollectionName);
    const userModel =
      this.app.get<Model<MongoUser.SchemaClass>>(userModelToken);
    if (userModel) {
      await userModel.deleteMany();
    }

    const webinaireModelToken = getModelToken(MongoWebinaire.CollectionName);
    const webinaireModel =
      this.app.get<Model<MongoWebinaire.SchemaClass>>(webinaireModelToken);
    if (webinaireModel) {
      await webinaireModel.deleteMany();
    }

    const pModelToken = getModelToken(MongoParticipation.CollectionName);
    const participationModel =
      this.app.get<Model<MongoParticipation.SchemaClass>>(pModelToken);
    if (participationModel) {
      await participationModel.deleteMany();
    }
  }
}
