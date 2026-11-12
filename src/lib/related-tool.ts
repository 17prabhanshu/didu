import { AI_TOOLS, type AITool } from './ai-launchpad';

const TOOL_KEYWORDS: Array<{ id: string; keywords: string[] }> = [
  { id: 'claude-code', keywords: ['claude code'] },
  { id: 'copilot-cli', keywords: ['copilot cli', 'github copilot'] },
  { id: 'antigravity', keywords: ['antigravity', 'agy'] },
  { id: 'codex', keywords: ['codex'] },
  { id: 'ollama', keywords: ['ollama'] },
  { id: 'gemini-api', keywords: ['gemini api', 'google genai', 'gemini'] },
];

/**
 * Finds the most relevant launchpad tool for an article so guides and news
 * posts can deep-link to the matching install walkthrough.
 */
export function findToolForArticle(
  ...parts: Array<string | null | undefined>
): AITool | undefined {
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  if (!haystack) return undefined;

  for (const entry of TOOL_KEYWORDS) {
    if (entry.keywords.some((keyword) => haystack.includes(keyword))) {
      return AI_TOOLS.find((tool) => tool.id === entry.id);
    }
  }

  return undefined;
}
