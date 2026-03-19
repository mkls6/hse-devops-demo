import type { ScoreEntry } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function getScoreboard(limit: number = 100): Promise<ScoreEntry[]> {
  const response = await fetch(`${API_BASE_URL}/scoreboard?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scoreboard: ${response.statusText}`);
  }
  return response.json();
}

export async function submitScore(nickname: string, score: number): Promise<ScoreEntry> {
  const response = await fetch(`${API_BASE_URL}/scoreboard`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname, score }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit score: ${response.statusText}`);
  }
  return response.json();
}
