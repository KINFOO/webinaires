import { addDays } from 'date-fns';
import * as request from 'supertest';
import { Webinaire } from '../webinaires/entities/webinaire.entity';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../webinaires/ports/webinaire-repository.interface';
import { WebinaireFixture } from './fixtures/webinaire-fixture';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: organizing a webinaire', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      new WebinaireFixture(
        new Webinaire({
          id: 'id-1',
          organizerId: e2eUsers.johnDoe.entity.props.id,
          seats: 50,
          title: 'Joy',
          startDate: addDays(new Date(), 4),
          endDate: addDays(new Date(), 5),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should create the webinaire', async () => {
      const id = 'id-1';
      const seats = 100;
      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createBasicAuthorizationToken())
        .send({ seats });

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );

      const webinaire = await webinaireRepository.findById(id);
      expect(webinaire).toBeDefined();
      expect(webinaire!.props.seats).toEqual(seats);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = 'id-1';
      const seats = 100;
      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .send({ seats });

      expect(result.status).toBe(403);
    });
  });
});
