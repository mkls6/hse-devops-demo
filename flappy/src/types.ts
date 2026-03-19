export interface Bird {
  x: number;
  y: number;
  w: number;
  h: number;
  velocity: number;
}

export interface Pipe {
  x: number;
  top: number;
  bottom: number;
  passed: boolean;
}

export interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  frame: number;
}

export interface ScoreEntry {
  nickname: string;
  score: number;
}

// Game constants
export const GRAVITY = 0.25;
export const FLAP = -4.5;
export const PIPE_SPEED = 2;
export const PIPE_GAP = 120;
export const BASE_WIDTH = 400;
export const BASE_HEIGHT = 600;
export const BIRD_WIDTH = 34;
export const BIRD_HEIGHT = 24;
export const BIRD_START_X = 50;
export const BIRD_START_Y = 150;
export const PIPE_WIDTH = 50;
export const PIPE_SPAWN_FRAME = 100;
