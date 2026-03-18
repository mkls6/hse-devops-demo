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
let resultSent = false;
let gameOverMessage = "";

const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;

const API_BASE =
  (typeof import.meta !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.env &&
    // @ts-ignore
    import.meta.env.VITE_API_BASE_URL) ||
  "/";

function draw() {
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
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over! Click to Restart", 10, canvas.height / 2);
    if (gameOverMessage) {
      ctx.font = "24px Arial";
      ctx.fillText(gameOverMessage, 10, canvas.height / 2 + 40);
    }
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
      triggerGameOver();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);
  score += 0.05;

  // Ground/Ceiling collision
  if (birdY > canvas.height || birdY < 0) triggerGameOver();
}

function triggerGameOver() {
  if (gameOver) return;
  gameOver = true;
  // send result once
  if (!resultSent) {
    resultSent = true;
    promptAndSendResult(Math.floor(score));
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("mousedown", () => {
  if (gameOver) {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    resultSent = false;
    gameOverMessage = "";
  } else {
    birdVelocity = FLAP;
  }
});

async function promptAndSendResult(finalScore: number) {
  try {
    const defaultName =
      (localStorage && localStorage.getItem("flappy_nickname")) || "";
    let nickname = prompt("Enter your nickname to save score:", defaultName);
    if (nickname === null) {
      gameOverMessage = "Score not saved.";
      return;
    }
    nickname = nickname.trim() || "anonymous";
    try {
      localStorage.setItem("flappy_nickname", nickname);
    } catch {
      // ignore
    }

    gameOverMessage = "Sending score...";
    // Draw immediately to show message
    draw();

    const res = await fetch(new URL("scoreboard", API_BASE).toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, score: finalScore }),
    });

    if (!res.ok) {
      let text = await res.text().catch(() => res.statusText || "error");
      try {
        const json = await res.json().catch(() => null);
        if (json && json.detail) text = json.detail;
      } catch {}
      gameOverMessage = `Failed to save: ${text}`;
    } else {
      const data = await res.json().catch(() => null);
      const shownScore =
        data && typeof data.score === "number" ? data.score : finalScore;
      gameOverMessage = `Score saved: ${shownScore}`;
    }
  } catch (err) {
    console.error("Failed to send score", err);
    gameOverMessage = "Failed to send score";
  } finally {
    draw();
  }
}

loop();
