import type { Pipe, Bird } from "./types";
import { PIPE_WIDTH, PIPE_SPEED, PIPE_GAP, PIPE_SPAWN_FRAME } from "./types";

export function createPipe(canvasWidth: number, canvasHeight: number): Pipe {
  const topHeight = Math.random() * (canvasHeight / 2) + 50;
  return {
    x: canvasWidth,
    top: topHeight,
    bottom: canvasHeight - topHeight - PIPE_GAP,
    passed: false,
  };
}

export function updatePipes(
  pipes: Pipe[],
  bird: Bird,
  frame: number,
  canvasWidth: number,
  canvasHeight: number
): { pipes: Pipe[]; score: number; gameOver: boolean } {
  let score = 0;
  let gameOver = false;

  // Spawn new pipe
  if (frame % PIPE_SPAWN_FRAME === 0) {
    pipes.push(createPipe(canvasWidth, canvasHeight));
  }

  // Update each pipe
  pipes.forEach((p) => {
    p.x -= PIPE_SPEED;

    // Collision detection
    if (
      bird.x < p.x + PIPE_WIDTH &&
      bird.x + bird.w > p.x &&
      (bird.y < p.top || bird.y + bird.h > canvasHeight - p.bottom)
    ) {
      gameOver = true;
    }

    // Score when passing pipe
    if (!p.passed && p.x < bird.x) {
      score++;
      p.passed = true;
    }
  });

  // Remove old pipes
  if (pipes.length > 0 && pipes[0].x < -PIPE_WIDTH) {
    pipes.shift();
  }

  return { pipes, score, gameOver };
}
