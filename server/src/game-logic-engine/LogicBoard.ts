import { PlayerDTO } from '@/player/dtos/player.dto';
import {
  BOARD_COLS, // force formatting
  BOARD_ROWS,
  BoardCell,
  GameBoard,
} from './constants';

export class LogicBoard {
  gameBoardState: GameBoard;
  lastUpdatedCell: BoardCell | null;

  constructor({
    gameBoardState,
    lastUpdatedCell,
  }: {
    gameBoardState?: GameBoard;
    lastUpdatedCell?: BoardCell | null;
  } = {}) {
    // TODO: `gameBoardState` seems like an odd variable name; maybe it should accept something
    // like `PlayeyMoves[]` and construct the board from that?
    this.gameBoardState = gameBoardState || LogicBoard.createEmptyBoardState();
    this.lastUpdatedCell = lastUpdatedCell || null;
  }

  updateBoardState({
    columnIndex,
    playerID,
  }: {
    columnIndex: number;
    playerID: PlayerDTO['playerID'];
  }): GameBoard {
    if (columnIndex < 0 || columnIndex >= BOARD_COLS) {
      throw new Error(
        `Invalid 'columnIndex' value ('${columnIndex}'): Must be between 0 and ${BOARD_COLS - 1}`,
      );
    }

    const columnCells = this.gameBoardState[columnIndex];
    const rowIndex = columnCells.findLastIndex(
      (cell) => cell.cellState === null,
    );

    if (rowIndex === -1) {
      throw new Error(`Column ${columnIndex} is full`);
    }

    this.gameBoardState[columnIndex][rowIndex].cellState = playerID;
    this.lastUpdatedCell = this.gameBoardState[columnIndex][rowIndex];

    return this.gameBoardState;
  }

  reset(): void {
    this.gameBoardState = LogicBoard.createEmptyBoardState();
    this.lastUpdatedCell = null;
  }

  static createEmptyBoardState(): GameBoard {
    const emptyBoard: GameBoard = new Array(BOARD_COLS);

    for (let i = 0; i < BOARD_COLS; i++) {
      emptyBoard[i] = [];
      for (let j = 0; j < BOARD_ROWS; j++) {
        emptyBoard[i][j] = {
          cellState: null,
          col: i,
          row: j,
        };
      }
    }

    return emptyBoard;
  }
}
