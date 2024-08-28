import * as request from 'supertest';
import {
  I_PARTICIPATION_REPOSITORY,
  IParticipationRepository,
} from '../webinaires/ports/participation-repository.interface';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: reserve a seat in a webinaire', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinaires.timeOfChange,
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should reserve a seat in the webinaire', async () => {
      const webinaireId = e2eWebinaires.timeOfChange.entity.props.id;
      const userId = 'bob';
      const result = await request(app.getHttpServer())
        .post(`/webinaires/${webinaireId}/participations`)
        .set('Authorization', e2eUsers.bob.createBasicAuthorizationToken())
        .send({ webinaireId, userId });

      expect(result.status).toBe(201);

      const participationRepository = app.get<IParticipationRepository>(
        I_PARTICIPATION_REPOSITORY,
      );

      const participation = await participationRepository.findOne(
        userId,
        webinaireId,
      );
      expect(participation).not.toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const webinaireId = e2eWebinaires.timeOfChange.entity.props.id;
      const result = await request(app.getHttpServer()).post(
        `/webinaires/${webinaireId}/participations`,
      );

      expect(result.status).toBe(403);
    });
  });
});
