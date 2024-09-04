import * as request from 'supertest';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: get a webinaire', () => {
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
    it('should get webinaire from id', async () => {
      const webinaire = e2eWebinaires.timeOfChange.entity;
      const webinaireId = webinaire.props.id;

      const result = await request(app.getHttpServer())
        .get(`/webinaires/${webinaireId}`)
        .set('Authorization', e2eUsers.johnDoe.createBasicAuthorizationToken());

      const organizer = e2eUsers.johnDoe.entity;
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        id: webinaireId,
        title: webinaire.props.title,
        startDate: webinaire.props.startDate.toISOString(),
        endDate: webinaire.props.endDate.toISOString(),
        organizer: {
          id: organizer.props.id,
          emailAddress: organizer.props.emailAddress,
        },
        seats: {
          available: webinaire.props.seats,
          reserved: 0,
        },
      });
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const webinaireId = e2eWebinaires.timeOfChange.entity.props.id;
      const result = await request(app.getHttpServer()).get(
        `/webinaires/${webinaireId}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
