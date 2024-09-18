import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { CancelSeatsCommand, CancelSeatsCommandHandler } from './cancel-seats';

describe('Feature: canceling webinaire', () => {
  async function expectParticipationToBeDeleted() {
    const participation = await participationRepository.findOne(
      testUsers.bob.props.id,
      webinaire.props.id,
    );
    expect(participation).toBeNull();
  }

  async function expectParticipationNotToBeDeleted() {
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

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinaireId: webinaire.props.id,
  });

  let useCase: CancelSeatsCommandHandler;
  let mailer: InMemoryMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinaireRepository: InMemoryWebinaireRepository;

  beforeEach(async () => {
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);

    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    mailer = new InMemoryMailer();
    useCase = new CancelSeatsCommandHandler(
      participationRepository,
      userRepository,
      webinaireRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = new CancelSeatsCommand(testUsers.bob, webinaire.props.id);

    it('should cancel a seat', async () => {
      await useCase.execute(payload);
      await expectParticipationToBeDeleted();
    });

    it('should send an email to organizer', async () => {
      await useCase.execute(payload);
      const [origanizerEmail] = mailer.sentEmails;
      expect(origanizerEmail).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'Participation canceled',
        body: `${testUsers.alice.props.emailAddress} dropped reservation for "${webinaire.props.title}"`,
      });
    });

    it('should send an email to participant', async () => {
      await useCase.execute(payload);

      const [_, participantEmail] = mailer.sentEmails;
      expect(participantEmail).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Participation canceled',
        body: `Your participation to "${webinaire.props.title}" has been canceled`,
      });
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = new CancelSeatsCommand(testUsers.bob, 'some-id-you-know');

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Webinaire not found',
      );
      await expectParticipationNotToBeDeleted();
    });
  });

  describe('Scenario: user does not attend webinaire', () => {
    const payload = new CancelSeatsCommand(
      testUsers.charles,
      webinaire.props.id,
    );

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'You were not attending this webinaire',
      );
      await expectParticipationNotToBeDeleted();
    });
  });
});
