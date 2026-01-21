
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LOADING = 'LOADING'
}

export interface Pipe {
  x: number;
  topHeight: number;
  width: number;
  passed: boolean;
}

export interface GameDimensions {
  width: number;
  height: number;
}

export interface ScoreData {
  current: number;
  high: number;
}
