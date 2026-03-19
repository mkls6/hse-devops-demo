import type { GameState } from "./types";
import { BASE_WIDTH, BASE_HEIGHT } from "./types";
import { createBird, updateBird } from "./bird";
import { updatePipes } from "./pipes";

export function createGameState(): GameState {
  return {
    bird: createBird(),
    pipes: [],
    score: 0,
    gameOver: false,
    frame: 0,
  };
}

export function resetGame(): GameState {
  return createGameState();
}

export function setGameOver(state: GameState): void {
  state.gameOver = true;
}

export function isGameOver(state: GameState): boolean {
  return state.gameOver;
}

export function getScore(state: GameState): number {
  return state.score;
}

export function updateGame(state: GameState, canvasHeight: number): void {
  if (state.gameOver) return;

  // Update bird
  const birdHitBoundary = updateBird(state.bird, canvasHeight);

  // Update pipes
  const { pipes, score, gameOver } = updatePipes(
    state.pipes,
    state.bird,
    state.frame,
    BASE_WIDTH,
    canvasHeight,
  );

  state.pipes = pipes;
  state.score += score;
  state.frame++;

  if (gameOver || birdHitBoundary) {
    state.gameOver = true;
  }
}

export function resizeCanvas(): void {
  const canvas = document.getElementById("game") as HTMLCanvasElement;

  const scale = Math.min(
    window.innerWidth / BASE_WIDTH,
    window.innerHeight / BASE_HEIGHT,
  );

  canvas.style.width = `${BASE_WIDTH * scale}px`;
  canvas.style.height = `${BASE_HEIGHT * scale}px`;
  canvas.style.position = "absolute";
  canvas.style.left = "50%";
  canvas.style.top = "50%";
  canvas.style.transform = "translate(-50%, -50%)";
}
