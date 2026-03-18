const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = 1000;
canvas.height = 1000;

// Game state
let birdY = canvas.height / 2;
let birdVelocity = 0;
let pipes: { x: number; top: number; bottom: number }[] = [];
let score = 0;
let gameOver = false;

const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bird
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(50, birdY, 30, 30);

  // Draw pipes
  ctx.fillStyle = "#4caf50";
  pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, PIPE_WIDTH, pipe.bottom);
  });

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(`Score: ${Math.floor(score)}`, 10, 40);

  if (gameOver) {
    ctx.fillText("Game Over! Click to Restart", 10, canvas.height / 2);
  }
}

function update() {
  if (gameOver) return;

  birdVelocity += GRAVITY;
  birdY += birdVelocity;

  // Pipe logic
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 500) {
    const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: canvas.height - topHeight - PIPE_GAP,
    });
  }

  pipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED;

    // Collision detection
    if (
      50 < pipe.x + PIPE_WIDTH &&
      50 + 30 > pipe.x &&
      (birdY < pipe.top || birdY + 30 > canvas.height - pipe.bottom)
    ) {
      gameOver = true;
    }
  });

  pipes = pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);
  score += 0.05;

  // Ground/Ceiling collision
  if (birdY > canvas.height || birdY < 0) gameOver = true;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Controls
window.addEventListener("mousedown", () => {
  if (gameOver) {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
  } else {
    birdVelocity = FLAP;
  }
});

loop();
