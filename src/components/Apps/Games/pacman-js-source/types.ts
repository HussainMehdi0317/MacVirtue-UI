// Game constants
export const DIRECTION_RIGHT = 4;
export const DIRECTION_UP = 3;
export const DIRECTION_LEFT = 2;
export const DIRECTION_BOTTOM = 1;

export const TILE_WALL = 1;
export const TILE_FOOD = 2;
export const TILE_EMPTY = 0;
export const TILE_EATEN = 3;

// Game map type
export type GameMap = number[][];

// Position type
export interface Position {
  x: number;
  y: number;
}

// Game config
// wait for it to load...
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  blockSize: number;
  fps: number;
}

// Game state
export interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  blockSize: number;
  animationImg: HTMLImageElement;
  ghostImg: HTMLImageElement;
}
