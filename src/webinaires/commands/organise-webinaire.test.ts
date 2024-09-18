import { FixedDateGenerator } from '../../core/adapters/fixed-date-generator';
import { FixedIDGenerator } from '../../core/adapters/fixed-id-generator';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Webinaire } from '../entities/webinaire.entity';
import {
  OrganizeWebinaireCommand,
  OrganizeWebinaireCommandHandler,
} from './organise-webinaire';

describe('Feature: organizing a webinaire', () => {
  function expectWebinaireToEqual(webinaire: Webinaire) {
    expect(webinaire.props).toEqual({
      id: 'id-1',
      organizerId: 'alice',
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    });
  }

  let repository: InMemoryWebinaireRepository;
  let useCase: OrganizeWebinaireCommandHandler;
  const idGenerator = new FixedIDGenerator();
  const dateGenerator = new FixedDateGenerator();

  beforeEach(() => {
    repository = new InMemoryWebinaireRepository();
    useCase = new OrganizeWebinaireCommandHandler(
      repository,
      idGenerator,
      dateGenerator,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = new OrganizeWebinaireCommand(
      'My first webinaire',
      new Date('2023-01-10T10:00:00.000Z'),
      new Date('2023-01-10T11:00:00.000Z'),
      100,
      testUsers.alice,
    );

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
    const payload = new OrganizeWebinaireCommand(
      'My first webinaire',
      new Date('2023-01-01T10:00:00.000Z'),
      new Date('2023-01-01T11:00:00.000Z'),
      100,
      testUsers.alice,
    );

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'Webinaire must happen in least 3 days',
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
    const payload = new OrganizeWebinaireCommand(
      'My first webinaire',
      new Date('2023-01-10T10:00:00.000Z'),
      new Date('2023-01-10T11:00:00.000Z'),
      1500,
      testUsers.alice,
    );

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'Webinaire must have a maximum of 1500 seats',
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
    const payload = new OrganizeWebinaireCommand(
      'My first webinaire',
      new Date('2023-01-10T10:00:00.000Z'),
      new Date('2023-01-10T11:00:00.000Z'),
      -1,
      testUsers.alice,
    );

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'Webinaire must have seats',
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
