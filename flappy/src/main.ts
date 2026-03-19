import "./style.css";
import {
  BASE_WIDTH,
  BASE_HEIGHT,
  PIPE_WIDTH,
  FLAP,
  type ScoreEntry,
} from "./types";
import { createGameState, updateGame, resizeCanvas } from "./game";
import { flap } from "./bird";
import { getScoreboard, submitScore } from "./api";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

ctx.imageSmoothingEnabled = false;

const crowImg = new Image();
crowImg.src = "/sprites/crow.png";

// Set canvas dimensions
canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

// Get colors from CSS variables
const colors = {
  bgTop: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-bg-top")
    .trim(),
  bgBottom: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-bg-bottom")
    .trim(),
  pipeDark: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-pipe-dark")
    .trim(),
  pipeLight: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-pipe-light")
    .trim(),
  pipeRim: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-pipe-rim")
    .trim(),
  star: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-star")
    .trim(),
  text: getComputedStyle(document.documentElement)
    .getPropertyValue("--color-text")
    .trim(),
};

// Game state
let state = createGameState();
let scoreboard: ScoreEntry[] = [];
let playerName = "";
let showScoreboardForm = false;
let isSubmitting = false;
let submitError: string | null = null;

// UI Elements
const scoreboardPanel = document.getElementById(
  "scoreboard-panel",
) as HTMLDivElement;
const scoreboardList = document.getElementById(
  "scoreboard-list",
) as HTMLUListElement;
const scoreForm = document.getElementById("score-form") as HTMLFormElement;
const nicknameInput = document.getElementById(
  "nickname-input",
) as HTMLInputElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const closeScoreboardBtn = document.getElementById(
  "close-scoreboard",
) as HTMLButtonElement;
const submitMessage = document.getElementById(
  "submit-message",
) as HTMLParagraphElement;

function drawBackground(): void {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colors.bgTop);
  grad.addColorStop(1, colors.bgBottom);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = colors.star;
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + state.frame * 0.2) % canvas.width;
    const y = (i * 53) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }

  // City silhouette
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < canvas.width; i += 60) {
    const h = 40 + Math.sin((i + state.frame) * 0.01) * 20;
    ctx.fillRect(i, canvas.height - h, 60, h);
  }
}

function drawPipe(x: number, top: number, bottom: number): void {
  const grad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
  grad.addColorStop(0, colors.pipeDark);
  grad.addColorStop(0.5, colors.pipeLight);
  grad.addColorStop(1, colors.pipeDark);

  ctx.fillStyle = grad;

  // Top pipe
  ctx.fillRect(x, 0, PIPE_WIDTH, top);

  // Bottom pipe
  ctx.fillRect(x, canvas.height - bottom, PIPE_WIDTH, bottom);

  // Highlight strip
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + PIPE_WIDTH * 0.15, 0, PIPE_WIDTH * 0.1, top);
  ctx.fillRect(
    x + PIPE_WIDTH * 0.15,
    canvas.height - bottom,
    PIPE_WIDTH * 0.1,
    bottom,
  );

  // Rim
  ctx.fillStyle = colors.pipeRim;
  ctx.fillRect(x - 2, top - 8, PIPE_WIDTH + 4, 8);
  ctx.fillRect(x - 2, canvas.height - bottom, PIPE_WIDTH + 4, 8);
}

function draw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Draw Bird (Crow)
  ctx.drawImage(
    crowImg,
    state.bird.x,
    state.bird.y,
    state.bird.w,
    state.bird.h,
  );

  // Draw Pipes
  state.pipes.forEach((p) => drawPipe(p.x, p.top, p.bottom));

  // Draw Score
  ctx.fillStyle = colors.text;
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score}`, 10, 30);

  if (state.gameOver) {
    ctx.font = "bold 24px Arial";
    ctx.fillText("Game Over", 140, canvas.height / 2 - 40);
    ctx.font = "16px Arial";
    ctx.fillText(`Final Score: ${state.score}`, 145, canvas.height / 2);
    ctx.fillText("Press ENTER to submit score", 110, canvas.height / 2 + 30);
    ctx.fillText("or click to restart", 145, canvas.height / 2 + 55);
  }
}

function updateScoreboardUI(): void {
  if (scoreboard.length === 0) {
    scoreboardList.innerHTML = "<li>No scores yet</li>";
    return;
  }

  scoreboardList.innerHTML = scoreboard
    .map(
      (entry, index) => `
      <li>
        <span class="rank">#${index + 1}</span>
        <span class="nickname">${escapeHtml(entry.nickname)}</span>
        <span class="score">${entry.score}</span>
      </li>
    `,
    )
    .join("");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadScoreboard(): Promise<void> {
  try {
    scoreboard = await getScoreboard(10);
    updateScoreboardUI();
  } catch (error) {
    console.error("Failed to load scoreboard:", error);
    scoreboardList.innerHTML = "<li>Failed to load scores</li>";
  }
}

async function handleSubmitScore(event: Event): Promise<void> {
  event.preventDefault();

  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    submitError = "Please enter a nickname";
    updateSubmitMessage();
    return;
  }

  isSubmitting = true;
  submitError = null;
  updateSubmitMessage();
  submitBtn.disabled = true;

  try {
    await submitScore(nickname, state.score);
    playerName = nickname;
    showScoreboardForm = false;
    scoreboardPanel.classList.remove("visible");
    await loadScoreboard();
    state = createGameState();
  } catch (error) {
    submitError =
      error instanceof Error ? error.message : "Failed to submit score";
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    updateSubmitMessage();
  }
}

function updateSubmitMessage(): void {
  if (submitError) {
    submitMessage.textContent = submitError;
    submitMessage.className = "error";
  } else if (isSubmitting) {
    submitMessage.textContent = "Submitting...";
    submitMessage.className = "loading";
  } else {
    submitMessage.textContent = "";
    submitMessage.className = "";
  }
}

function gameLoop(): void {
  updateGame(state, BASE_HEIGHT);
  draw();
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener("mousedown", (e: MouseEvent) => {
  // Ignore clicks on scoreboard panel
  if (scoreboardPanel.contains(e.target as Node)) {
    return;
  }

  if (state.gameOver) {
    state = createGameState();
    showScoreboardForm = false;
    scoreboardPanel.classList.remove("visible");
  } else {
    flap(state.bird, FLAP);
  }
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && state.gameOver && !showScoreboardForm) {
    showScoreboardForm = true;
    scoreboardPanel.classList.add("visible");
    nicknameInput.value = playerName;
    nicknameInput.focus();
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Scoreboard controls
scoreForm.addEventListener("submit", handleSubmitScore);
closeScoreboardBtn.addEventListener("click", () => {
  showScoreboardForm = false;
  scoreboardPanel.classList.remove("visible");
  if (state.gameOver) {
    state = createGameState();
  }
});

// Initial load
loadScoreboard();

// Start game when image loads
crowImg.onload = () => gameLoop();
