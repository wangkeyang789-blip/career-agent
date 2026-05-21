import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

const STAGE_ORDER = ["connect", "explore", "match", "prepare", "interview", "review"] as const;

/**
 * Load the system prompt for a given stage.
 * Falls back to a default prompt if the file doesn't exist.
 */
export function loadPrompt(stage: string): string {
  const fileName = `${STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number]) + 1}-${stage}.md`;

  try {
    const filePath = path.join(PROMPTS_DIR, fileName);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    // Fallback: generate a basic prompt
    return `You are a professional career coach AI. Current stage: ${stage}. Help the user with their career journey. Respond in Chinese.`;
  }
}
