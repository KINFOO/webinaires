import * as request from 'supertest';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../webinaires/ports/webinaire-repository.interface';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: cancel a webinaire', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinaires.timeOfChange]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should succeed', async () => {
      const webinaireId = e2eWebinaires.timeOfChange.entity.props.id;
      const result = await request(app.getHttpServer())
        .delete(`/webinaires/${webinaireId}`)
        .set('Authorization', e2eUsers.johnDoe.createBasicAuthorizationToken());

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );

      const webinaire = await webinaireRepository.findById(webinaireId);
      expect(webinaire).toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const webinaireId = e2eWebinaires.timeOfChange.entity.props.id;
      const result = await request(app.getHttpServer()).delete(
        `/webinaires/${webinaireId}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
