import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import {
  CancelWebinaireCommand,
  CancelWebinaireCommandHandler,
} from './cancel-webinaire';

describe('Feature: canceling webinaire', () => {
  function expectWebinaireToBeDeleted() {
    const deletedWebinaire = webinaireRepository.findByIdSync('id-1');
    expect(deletedWebinaire).toBeNull();
  }

  function expectWebinaireNotToBeDeleted() {
    const deletedWebinaire = webinaireRepository.findByIdSync('id-1');
    expect(deletedWebinaire).not.toBeNull();
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

  let useCase: CancelWebinaireCommandHandler;
  let mailer: InMemoryMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinaireRepository: InMemoryWebinaireRepository;

  beforeEach(async () => {
    mailer = new InMemoryMailer();
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);

    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    useCase = new CancelWebinaireCommandHandler(
      webinaireRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = new CancelWebinaireCommand(
      testUsers.alice,
      webinaire.props.id,
    );

    it('delete the webinaire', async () => {
      await useCase.execute(payload);
      expectWebinaireToBeDeleted();
    });

    it('should send an email to every participants', async () => {
      await useCase.execute(payload);
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinaire canceled',
          body: 'Webinaire "Dexter Morgan fan club" has been canceled',
        },
      ]);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = new CancelWebinaireCommand(testUsers.alice, 'id-2');

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Webinaire not found',
      );
      expectWebinaireNotToBeDeleted();
    });
  });

  describe('Scenario: delete someone else webinaire', () => {
    const payload = new CancelWebinaireCommand(
      testUsers.bob,
      webinaire.props.id,
    );

    it('should fail', async () => {
      expect(async () => await useCase.execute(payload)).rejects.toThrowError(
        'Not allowed to update this webinaire',
      );
      expectWebinaireNotToBeDeleted();
    });
  });
});
