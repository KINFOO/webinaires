import { FixedDateGenerator } from '../adapters/fixed-date-generator';
import { FixedIDGenerator } from '../adapters/fixed-id-generator';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { User } from '../entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { OrganizeWebinaire } from './organise-webinaire';

describe('Feature: organizing a webinaire', () => {
  function expectWebinaireToEqual(webinaire: Webinaire) {
    expect(webinaire.props).toEqual({
      id: 'id-1',
      organizerId: 'john-doe',
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    });
  }

  const idGenerator = new FixedIDGenerator();
  const dateGenerator = new FixedDateGenerator();
  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'azerty',
  });
  let repository = new InMemoryWebinaireRepository();
  let useCase = new OrganizeWebinaire(repository, idGenerator, dateGenerator);

  beforeEach(() => {
    repository = new InMemoryWebinaireRepository();
    useCase = new OrganizeWebinaire(repository, idGenerator, dateGenerator);
  });

  describe('Scenario: happy path', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      user: johnDoe,
    };

    it('should return the ID', async () => {
      const result = await useCase.execute(payload);

      expect(result.id).toEqual('id-1');
    });

    it('insert a webinaire in database', async () => {
      await useCase.execute(payload);

      expect(repository.database.length).toBe(1);

      const [webinaire] = repository.database;
      expectWebinaireToEqual(webinaire);
    });
  });

  describe('Scenario: webinaire happens to soon', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-01T10:00:00.000Z'),
      endDate: new Date('2023-01-01T11:00:00.000Z'),
      user: johnDoe,
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must happen in least 3 days',
      );
    });
    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: webinaire has to many seats', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 1500,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      user: johnDoe,
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must have a maximum of 1500 seats',
      );
    });
    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: webinaire must have seats', () => {
    const payload = {
      title: 'My first webinaire',
      seats: -1,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      user: johnDoe,
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must have seats',
      );
    });
    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });
});
