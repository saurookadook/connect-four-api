import { UUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  CreateGameSessionDTO,
  UpdateGameSessionDTO,
} from '@game-engine/dtos/game-session.dto';
import {
  GameSession,
  GameSessionDocument,
  NullableGameSessionDocument,
} from '@game-engine/schemas/game-session.schema';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSessionDocument>,
  ) {}

  async findOneById(id: Types.ObjectId): Promise<NullableGameSessionDocument> {
    return await this.gameSessionModel.findById(id).exec();
  }

  async findAllForPlayer(playerID: UUID): Promise<GameSessionDocument[]> {
    return this.gameSessionModel
      .find({
        $or: [{ playerOneID: playerID }, { playerTwoID: playerID }],
      })
      .exec();
  }

  async createOne(
    gameSession: CreateGameSessionDTO,
  ): Promise<GameSessionDocument> {
    const createdGameSession = new this.gameSessionModel(gameSession);
    return createdGameSession.save();
  }

  async updateOne(
    id: string,
    gameSession: UpdateGameSessionDTO,
  ): Promise<NullableGameSessionDocument> {
    return this.gameSessionModel
      .findByIdAndUpdate(id, gameSession, { new: true })
      .exec();
  }

  async deleteTodo(id: string): Promise<NullableGameSessionDocument> {
    return this.gameSessionModel.findByIdAndDelete(id).exec();
  }
}
