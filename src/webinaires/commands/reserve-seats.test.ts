import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import {
  ReserveSeatsCommand,
  ReserveSeatsCommandHandler,
} from './reserve-seats';

describe('Feature: canceling webinaire', () => {
  async function expectParticipationNotToBeCreated() {
    const participation = await participationRepository.findOne(
      testUsers.bob.props.id,
      webinaire.props.id,
    );
    expect(participation).toBeNull();
  }

  async function expectParticipationToBeCreated() {
    const participation = await participationRepository.findOne(
      testUsers.bob.props.id,
      webinaire.props.id,
    );
    expect(participation).not.toBeNull();
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    title: 'Dexter Morgan fan club',
    seats: 50,
    startDate: new Date('2023-01-20T10:00:00.000Z'),
    endDate: new Date('2023-01-21T11:00:00.000Z'),
    organizerId: testUsers.alice.props.id,
  });

  const singleSeatWebinaire = new Webinaire({
    id: 'id-2',
    title: 'Deluxe',
    seats: 1,
    startDate: new Date('2023-01-20T10:00:00.000Z'),
    endDate: new Date('2023-01-21T11:00:00.000Z'),
    organizerId: testUsers.alice.props.id,
  });

  const charlesParticipation = new Participation({
    userId: testUsers.charles.props.id,
    webinaireId: singleSeatWebinaire.props.id,
  });

  let useCase: ReserveSeatsCommandHandler;
  let mailer: InMemoryMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinaireRepository: InMemoryWebinaireRepository;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
      testUsers.charles,
    ]);

    mailer = new InMemoryMailer();

    const webinaires = [webinaire, singleSeatWebinaire];
    webinaireRepository = new InMemoryWebinaireRepository(webinaires);

    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);

    useCase = new ReserveSeatsCommandHandler(
      participationRepository,
      userRepository,
      webinaireRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = new ReserveSeatsCommand(testUsers.bob, webinaire.props.id);

    it('should reserve a seat', async () => {
      await useCase.execute(payload);
      await expectParticipationToBeCreated();
    });

    it('should send an email to organizer', async () => {
      await useCase.execute(payload);
      const [origanizerEmail] = mailer.sentEmails;
      expect(origanizerEmail).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'New participation',
        body: `New reservation for "${webinaire.props.title}"`,
      });
    });

    it('should send an email to participant', async () => {
      await useCase.execute(payload);

      const [_, participantEmail] = mailer.sentEmails;
      expect(participantEmail).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Participation accepted',
        body: `Your participation to "${webinaire.props.title}" has been accepted`,
      });
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = new ReserveSeatsCommand(testUsers.bob, 'some-id-you-know');

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Webinaire not found',
      );
      await expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: webinaire is full', () => {
    const payload = new ReserveSeatsCommand(
      testUsers.bob,
      singleSeatWebinaire.props.id,
    );

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Webinaire is full',
      );
      await expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: reserve a seat in an already full webinaire', () => {
    const payload = new ReserveSeatsCommand(
      testUsers.bob,
      singleSeatWebinaire.props.id,
    );

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Webinaire is full',
      );
      await expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: reserve a seat you already have one', () => {
    const payload = new ReserveSeatsCommand(
      testUsers.charles,
      singleSeatWebinaire.props.id,
    );

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        "You're already attending this webinaire",
      );
      await expectParticipationNotToBeCreated();
    });
  });
});
