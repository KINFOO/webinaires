import { addDays } from 'date-fns';
import * as request from 'supertest';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../webinaires/ports/webinaire-repository.interface';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: organizing a webinaire', () => {
  let app: TestApp;
  const startDate = addDays(new Date(), 4);
  const endDate = addDays(new Date(), 5);

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should create the webinaire', async () => {
      const result = await request(app.getHttpServer())
        .post('/webinaires')
        .set('Authorization', e2eUsers.johnDoe.createBasicAuthorizationToken())
        .send({
          title: 'My first webinaire',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );
      const webinaire = await webinaireRepository.findById(result.body.id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props).toEqual({
        id: result.body.id,
        title: 'My first webinaire',
        organizerId: 'john-doe',
        startDate,
        endDate,
        seats: 100,
      });
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const result = await request(app.getHttpServer())
        .post('/webinaires')
        .send({
          title: 'My first webinaire',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(403);
    });
  });
});
