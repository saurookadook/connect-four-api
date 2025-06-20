import { UUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlayerService } from '@/player/player.service';
import {
  CreateGameSessionDTO,
  UpdateGameSessionDTO,
} from '../dtos/game-session.dto';
import {
  GameSession,
  GameSessionDocument,
  NullableGameSessionDocument,
} from '../schemas/game-session.schema';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSessionDocument>,
    private readonly playerService: PlayerService,
  ) {}

  async createOne(
    gameSession: CreateGameSessionDTO,
  ): Promise<GameSessionDocument> {
    try {
      await this._validatePlayers({
        playerOneID: gameSession.playerOneID,
        playerTwoID: gameSession.playerTwoID,
      });
      const createdGameSession = new this.gameSessionModel(gameSession);
      return createdGameSession.save();
    } catch (error) {
      // console.error(error);
      throw new Error(
        '[GameSessionService.createOne] Encountered ERROR while creating game session: ',
        error,
      );
    }
  }

  async findOneById(id: string): Promise<NullableGameSessionDocument> {
    return await this.gameSessionModel.findById(id).exec();
  }

  async findAllForPlayer(playerID: UUID): Promise<GameSessionDocument[]> {
    return this.gameSessionModel
      .find({
        $or: [{ playerOneID: playerID }, { playerTwoID: playerID }],
      })
      .exec();
  }

  async updateOne(
    id: string,
    gameSession: UpdateGameSessionDTO,
  ): Promise<NullableGameSessionDocument> {
    return this.gameSessionModel
      .findByIdAndUpdate(id, gameSession, { new: true })
      .exec();
  }

  async deleteOneById(id: string): Promise<NullableGameSessionDocument> {
    return this.gameSessionModel.findByIdAndDelete(id).exec();
  }

  async _validatePlayers({
    playerOneID,
    playerTwoID,
  }: {
    playerOneID: UUID;
    playerTwoID: UUID;
  }): Promise<void> {
    if (playerOneID === playerTwoID) {
      throw new TypeError(
        '[GameSessionService._validatePlayers] Player IDs must be different.',
      );
    }

    const playerOneExists =
      await this.playerService.findOneByPlayerID(playerOneID);

    if (!playerOneExists) {
      throw new Error(
        `[GameSessionService._validatePlayers] Player One with ID '${playerOneID}' does not exist.`,
      );
    }

    const playerTwoExists =
      await this.playerService.findOneByPlayerID(playerTwoID);

    if (!playerTwoExists) {
      throw new Error(
        `[GameSessionService._validatePlayers] Player Two with ID '${playerTwoID}' does not exist.`,
      );
    }
  }
}
