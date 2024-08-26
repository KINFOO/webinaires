import { User } from '../../users/entities/user.entity';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Webinaire } from '../entities/webinaire.entity';
import { ChangeSeats } from './change-seats';

describe("Feature: updating webinaire's seats", () => {
  function expectSeatsToRemainUnchanged() {
    const webinaire = repository.findByIdSync('id-1');
    expect(webinaire!.props.seats).toEqual(50);
  }

  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'azerty',
  });

  const janeDoe = new User({
    id: 'jane-doe',
    emailAddress: 'jane@gmail.com',
    password: 'azerty',
  });

  const webinaire = new Webinaire({
    id: 'id-1',
    title: 'Joy',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
    organizerId: johnDoe.props.id,
  });

  let repository: InMemoryWebinaireRepository;
  let useCase: ChangeSeats;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository([webinaire]);
    useCase = new ChangeSeats(repository);
  });

  describe('Scenario: happy path', () => {
    it('should change the number of seats', async () => {
      await useCase.execute({
        user: johnDoe,
        webinaireId: 'id-1',
        seats: 100,
      });

      const webinaire = await repository.findById('id-1');
      expect(webinaire).not.toBeNull();
      expect(webinaire!.props.seats).toEqual(100);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    it('should fail', async () => {
      expect(async () => {
        await useCase.execute({
          user: johnDoe,
          webinaireId: 'id-2',
          seats: 100,
        });
      }).rejects.toThrow('Webinaire not found');

      const webinaire = await repository.findById('id-2');
      expect(webinaire).toBeNull();
    });
  });

  describe("Scenario: user is not webinaire's organizer", () => {
    it('should fail', async () => {
      expect(async () => {
        await useCase.execute({
          user: janeDoe,
          webinaireId: 'id-1',
          seats: 100,
        });
      }).rejects.toThrow('Seats update is restricted to organizer');

      await expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: seat decrease', () => {
    it('should fail', async () => {
      expect(async () => {
        await useCase.execute({
          user: johnDoe,
          webinaireId: 'id-1',
          seats: 49,
        });
      }).rejects.toThrow('Seats upgrade only');

      await expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: increase seats above limit', () => {
    it('should fail', async () => {
      expect(async () => {
        await useCase.execute({
          user: johnDoe,
          webinaireId: 'id-1',
          seats: 1001,
        });
      }).rejects.toThrow('The webinaire must have a maximum of 1500 seats');

      await expectSeatsToRemainUnchanged();
    });
  });
});
