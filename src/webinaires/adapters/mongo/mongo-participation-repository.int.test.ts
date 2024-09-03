import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { testUsers } from '../../../users/tests/user-seeds';
import { Participation } from '../../entities/participation.entity';
import { testWebinaires } from '../../tests/webinaire-seeds';
import { MongoParticipation } from './mongo-participation';
import { MongoParticipationRepository } from './mongo-participation-repository';

describe('MongoWebinaireRepository', () => {
  async function createParticipationInDatabase(participation: Participation) {
    const _id = MongoParticipation.SchemaClass.makeId(participation);
    const record = new model({ _id, ...participation.props });
    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoParticipation.SchemaClass>;
  let repository: MongoParticipationRepository;
  const participation = new Participation({
    userId: testUsers.alice.props.id,
    webinaireId: testWebinaires.cqrs.props.id,
  });

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    const token = getModelToken(MongoParticipation.CollectionName);
    model = app.get<Model<MongoParticipation.SchemaClass>>(token);
    repository = new MongoParticipationRepository(model);

    await createParticipationInDatabase(participation);
  });

  describe('findByWebinaireId', () => {
    it('should find participation for this id', async () => {
      const id = testWebinaires.cqrs.props.id;
      const participations = await repository.findByWebinaireId(id);

      expect(participations).toHaveLength(1);
      expect([participation.props]).toEqual([participations[0].props]);
    });

    it('should fail with unknown id', async () => {
      const participations =
        await repository.findByWebinaireId('does-not-exist');

      expect(participations).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find participation for this user and webinaire id', async () => {
      const userId = testUsers.alice.props.id;
      const webinaireId = testWebinaires.cqrs.props.id;
      const oneParticipation = await repository.findOne(userId, webinaireId);

      expect(oneParticipation).not.toBeNull();
      expect(oneParticipation!.props).toEqual(participation.props);
    });

    it('should fail with unknown user and webinaire ids', async () => {
      const someParticipation = await repository.findOne(
        'no-user',
        'no-webinaire',
      );

      expect(someParticipation).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a participation', async () => {
      const newParticipation = new Participation({
        userId: 'bob',
        webinaireId: 'Blues at sunrise',
      });

      await repository.create(newParticipation);

      const _id = MongoParticipation.SchemaClass.makeId(newParticipation);
      const record = await model.findById(_id);

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id,
        ...newParticipation.props,
      });
    });
  });

  describe('count', () => {
    it('should return participation count', async () => {
      const count = await repository.count(testWebinaires.cqrs.props.id);

      expect(count).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete participation', async () => {
      await repository.delete(participation);

      const id = MongoParticipation.SchemaClass.makeId(participation);
      const record = await model.findById(id);
      expect(record).toBeNull();
    });
  });

  afterEach(async () => await app.cleanup());
});
