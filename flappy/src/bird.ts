import type { Bird } from "./types";
import { GRAVITY, BIRD_START_X, BIRD_START_Y, BIRD_WIDTH, BIRD_HEIGHT } from "./types";

export function createBird(): Bird {
  return {
    x: BIRD_START_X,
    y: BIRD_START_Y,
    w: BIRD_WIDTH,
    h: BIRD_HEIGHT,
    velocity: 0,
  };
}

export function updateBird(bird: Bird, canvasHeight: number): boolean {
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Check floor/ceiling collision
  if (bird.y + bird.h > canvasHeight || bird.y < 0) {
    return true; // gameOver
  }

  return false;
}

export function flap(bird: Bird, flapForce: number): void {
  bird.velocity = flapForce;
}
