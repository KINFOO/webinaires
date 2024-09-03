import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { Webinaire } from '../../entities/webinaire.entity';
import { testWebinaires } from '../../tests/webinaire-seeds';
import { MongoWebinaire } from './mongo-webinaire';
import { MongoWebinaireRepository } from './mongo-webinaire-repository';

describe('MongoWebinaireRepository', () => {
  async function createWebinaireInDatabase(webinaire: Webinaire) {
    const { id, ...props } = webinaire.props;
    const record = new model({ _id: id, ...props });
    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoWebinaire.SchemaClass>;
  let repository: MongoWebinaireRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    const token = getModelToken(MongoWebinaire.CollectionName);
    model = app.get<Model<MongoWebinaire.SchemaClass>>(token);
    repository = new MongoWebinaireRepository(model);

    await createWebinaireInDatabase(testWebinaires.masterClass);
  });

  describe('findById', () => {
    it('should find user for this id', async () => {
      const { id } = testWebinaires.masterClass.props;
      const webinaire = await repository.findById(id);

      expect(webinaire).not.toBeNull();
      expect(webinaire!.props).toEqual(testWebinaires.masterClass.props);
    });

    it('should fail with unknown id', async () => {
      const user = await repository.findById('does-not-exist');

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create webinaire', async () => {
      await repository.create(testWebinaires.cqrs);

      const { id: _id, ...props } = testWebinaires.cqrs.props;
      const record = await model.findById(_id);

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id,
        ...props,
      });
    });
  });

  describe('update', () => {
    it('should update webinaire', async () => {
      await repository.create(testWebinaires.cqrs);

      const cqrsCopy = testWebinaires.cqrs.clone() as Webinaire;
      cqrsCopy.update({ title: 'ssé cul air hess' });
      await repository.update(cqrsCopy);

      const record = await model.findById(testWebinaires.cqrs.props.id);
      const { id: _id, ...props } = cqrsCopy.props;
      expect(record?.toObject()).toEqual({
        __v: 0,
        _id,
        ...props,
      });

      expect(cqrsCopy.props).toEqual(cqrsCopy.initialState);
    });
  });

  describe('delete', () => {
    it('should delete webinaire', async () => {
      await repository.delete(testWebinaires.masterClass);

      const record = await model.findById(testWebinaires.masterClass.props.id);
      expect(record).toBeNull();
    });
  });

  afterEach(async () => await app.cleanup());
});
