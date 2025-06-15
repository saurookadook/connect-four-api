import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { GAME_SESSION_MODEL_TOKEN, GameSessionStatus } from '@/constants';
import { databaseProviders } from '@/database/database.providers';
import { GameSession } from '@/game-engine/schemas/game-session.schema';
import { GameSessionModule } from '@/game-engine/session/game-session.module';
import { GameSessionService } from '@/game-engine/session/game-session.service';

const mockFirstPlayerID = randomUUID();
const mockSecondPlayerID = randomUUID();
const mockThirdPlayerID = randomUUID();

describe('GameSessionController', () => {
  let app: INestApplication<App>;
  let mongoConnection: Connection;
  let service: GameSessionService;
  let model: Model<GameSession>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...databaseProviders, // force formatting
        GameSessionModule,
      ],
    }).compile();

    app = module.createNestApplication();
    mongoConnection = await app.resolve(getConnectionToken());

    service = await app.resolve(GameSessionService);
    model = await app.resolve(GAME_SESSION_MODEL_TOKEN);
    await app.init();
  });

  beforeEach(async () => {
    await service.createOne({
      playerOneID: mockFirstPlayerID,
      playerTwoID: mockSecondPlayerID,
    });
    await service.createOne({
      playerOneID: mockSecondPlayerID,
      playerTwoID: mockFirstPlayerID,
    });
    await service.createOne({
      playerOneID: mockThirdPlayerID,
      playerTwoID: mockSecondPlayerID,
    });
  });

  afterEach(async () => {
    await model.deleteMany({}).exec();
    jest.clearAllTimers();
  });

  afterAll(async () => {
    await model.deleteMany({}).exec();
    await mongoConnection.close();
    jest.useRealTimers();
  });

  describe('/game-session/history (GET)', () => {
    it('should return game session history for a player', async () => {
      await request(app.getHttpServer())
        .get(`/game-session/history/${mockFirstPlayerID}`)
        .expect((result) => {
          // console.log({ result });
          const resultBody = JSON.parse(result.text);
          expect(resultBody.sessions).toHaveLength(2);
          // TODO: add more assertions
          expect(result.status).toBe(200);
        });

      await request(app.getHttpServer())
        .get(`/game-session/history/${mockSecondPlayerID}`)
        .expect((result) => {
          // console.log({ result });
          const resultBody = JSON.parse(result.text);
          expect(resultBody.sessions).toHaveLength(3);
          // TODO: add more assertions
          expect(result.status).toBe(200);
        });

      await request(app.getHttpServer())
        .get(`/game-session/history/${mockThirdPlayerID}`)
        .expect((result) => {
          // console.log({ result });
          const resultBody = JSON.parse(result.text);
          expect(resultBody.sessions).toHaveLength(1);
          // TODO: add more assertions
          expect(result.status).toBe(200);
        });
    });
  });
});
