import { FixedDateGenerator } from '../../core/adapters/fixed-date-generator';
import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { ChangeDates } from './change-dates';

describe("Feature: updating webinaire's dates", () => {
  function expectDatesToRemainUnchanged() {
    const updatedWebinaire = webinaireRepository.findByIdSync('id-1');
    expect(updatedWebinaire!.props.startDate).toEqual(
      webinaire.props.startDate,
    );
    expect(updatedWebinaire!.props.endDate).toEqual(webinaire.props.endDate);
  }
  const dateGeneraror = new FixedDateGenerator();
  const webinaire = new Webinaire({
    id: 'id-1',
    title: 'Joy',
    seats: 50,
    startDate: new Date('2023-01-20T10:00:00.000Z'),
    endDate: new Date('2023-01-21T11:00:00.000Z'),
    organizerId: testUsers.alice.props.id,
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinaireId: webinaire.props.id,
  });

  let useCase: ChangeDates;
  let mailer: InMemoryMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinaireRepository: InMemoryWebinaireRepository;

  beforeEach(async () => {
    mailer = new InMemoryMailer();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    useCase = new ChangeDates(
      participationRepository,
      userRepository,
      webinaireRepository,
      dateGeneraror,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const startDate = new Date('2024-01-10T10:00:00.000Z');
    const endDate = new Date('2024-01-10T11:00:00.000Z');
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      startDate,
      endDate,
    };

    it('should change dates', async () => {
      await useCase.execute(payload);

      const webinaire = webinaireRepository.findByIdSync('id-1');
      expect(webinaire).toBeDefined();
      expect(webinaire!.props.startDate).toEqual(startDate);
      expect(webinaire!.props.endDate).toEqual(endDate);
    });

    it('should send an email to the participants', async () => {
      await useCase.execute(payload);

      const webinaire = webinaireRepository.findByIdSync('id-1');
      expect(webinaire).toBeDefined();
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: `The dates of "Joy" have changed`,
          body: 'New dates are 2024-01-10T10:00:00.000Z - 2024-01-10T11:00:00.000Z',
        },
      ]);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    it('should fail', async () => {
      const payload = {
        user: testUsers.alice,
        webinaireId: 'id-2',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
      };

      expect(async () => await useCase.execute(payload)).rejects.toThrow(
        'Webinaire not found',
      );

      const webinaire = await webinaireRepository.findById('id-2');
      expect(webinaire).toBeNull();
    });
  });

  describe("Scenario: user is not webinaire's organizer", () => {
    it('should fail', async () => {
      const payload = {
        user: testUsers.bob,
        webinaireId: 'id-1',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
      };

      expect(async () => await useCase.execute(payload)).rejects.toThrow(
        'Dates update is restricted to organizer',
      );

      await expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: change date close to today', () => {
    it('should fail', async () => {
      const payload = {
        user: testUsers.alice,
        webinaireId: 'id-1',
        startDate: new Date('2023-01-01T00:00:00.000Z'),
        endDate: new Date('2023-01-03T00:00:00.000Z'),
      };

      expect(async () => await useCase.execute(payload)).rejects.toThrow(
        'The webinaire must happen in least 3 days',
      );

      await expectDatesToRemainUnchanged();
    });
  });

  // describe('Scenario: increase seats above limit', () => {
  //   it('should send an email to the participants', async () => {
  //     const payload = {
  //       user: testUsers.alice,
  //       webinaireId: 'id-1',
  //       seats: 1001,
  //     };

  //     expect(async () => await useCase.execute(payload)).rejects.toThrow(
  //       'The webinaire must have a maximum of 1500 seats',
  //     );

  //     await expectDatesToRemainUnchanged();
  //   });
  // });
});
