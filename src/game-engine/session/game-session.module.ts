import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GameSession,
  GameSessionSchema,
} from '@game-engine/schemas/game-session.schema';
import { GameSessionController } from '@game-engine/session/game-session.controller';
import { GameSessionService } from '@game-engine/session/game-session.service';

@Module({
  controllers: [GameSessionController],
  imports: [
    MongooseModule.forFeature([
      { name: GameSession.name, schema: GameSessionSchema },
    ]),
  ],
  providers: [GameSessionService],
  exports: [GameSessionService],
})
export class GameSessionModule {}
