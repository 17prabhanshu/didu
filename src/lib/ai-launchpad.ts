export type Platform = "unix" | "windows";

export interface ToolStep {
  label: string;
  unix: string;
  windows: string;
  note?: string;
}

export interface AITool {
  id: string;
  name: string;
  provider: string;
  tagline: string;
  description: string;
  category: "Terminal agent" | "Agentic IDE" | "Local models" | "API";
  pricing: string;
  requires: string[];
  install: ToolStep;
  auth: ToolStep;
  run: ToolStep;
  example: ToolStep;
  docsUrl: string;
  siteUrl: string;
  githubUrl?: string;
  accent: {
    text: string;
    bg: string;
    border: string;
    gradient: string;
  };
}

export const AI_TOOLS: AITool[] = [
  {
    id: "codex",
    name: "Codex CLI",
    provider: "OpenAI",
    tagline: "GPT in your terminal",
    description:
      "OpenAI's lightweight coding agent. It reads your repository, edits files, runs commands, and works through multi-step engineering tasks from a single prompt.",
    category: "Terminal agent",
    pricing: "Included with ChatGPT Plus / Pro",
    requires: ["ChatGPT account or OpenAI API key", "macOS, Linux, or Windows"],
    install: {
      label: "Install",
      unix: "curl -fsSL https://chatgpt.com/codex/install.sh | sh",
      windows:
        'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"',
      note: "Prefer npm? Run: npm install -g @openai/codex",
    },
    auth: {
      label: "Authenticate",
      unix: "codex",
      windows: "codex",
      note: 'Choose "Sign in with ChatGPT" on first launch, or configure an API key.',
    },
    run: {
      label: "Start a session",
      unix: "cd my-project && codex",
      windows: "cd my-project; codex",
    },
    example: {
      label: "Try it",
      unix: 'codex "Explain this codebase and suggest three improvements"',
      windows: 'codex "Explain this codebase and suggest three improvements"',
    },
    docsUrl: "https://developers.openai.com/codex",
    siteUrl: "https://openai.com/codex",
    githubUrl: "https://github.com/openai/codex",
    accent: {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    provider: "Google",
    tagline: "Gemini agents, IDE + terminal",
    description:
      "Google's agent-first development platform. Use the Antigravity app or IDE for a visual workspace, or the agy CLI for a terminal-first multi-agent experience powered by Gemini.",
    category: "Agentic IDE",
    pricing: "Free with a personal Google account",
    requires: ["macOS 13+, Windows 10+, or Linux", "Google account"],
    install: {
      label: "Install the CLI",
      unix: "curl -fsSL https://antigravity.google/cli/install.sh | bash",
      windows: "irm https://antigravity.google/cli/install.ps1 | iex",
      note: "Want the IDE instead? Download it from antigravity.google/download",
    },
    auth: {
      label: "Sign in",
      unix: "agy",
      windows: "agy",
      note: "Complete the browser sign-in with your Google account, then finish the terminal setup.",
    },
    run: {
      label: "Start a session",
      unix: "cd my-project && agy",
      windows: "cd my-project; agy",
    },
    example: {
      label: "Try it",
      unix: 'agy -p "Add unit tests for the authentication handlers"',
      windows: 'agy -p "Add unit tests for the authentication handlers"',
    },
    docsUrl: "https://antigravity.google/docs/getting-started",
    siteUrl: "https://antigravity.google",
    accent: {
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
  },
  {
    id: "claude-code",
    name: "Claude Code",
    provider: "Anthropic",
    tagline: "Agentic coding in your terminal",
    description:
      "Anthropic's terminal-native coding agent. It understands entire codebases, edits multiple files, runs tests, handles git workflows, and connects to tools through MCP.",
    category: "Terminal agent",
    pricing: "Requires a paid Claude plan or API access",
    requires: ["Claude Pro, Max, Team, Enterprise, or Console account", "macOS, Linux, WSL, or Windows"],
    install: {
      label: "Install",
      unix: "curl -fsSL https://claude.ai/install.sh | bash",
      windows: "irm https://claude.ai/install.ps1 | iex",
      note: "Prefer npm? Run: npm install -g @anthropic-ai/claude-code",
    },
    auth: {
      label: "Authenticate",
      unix: "claude",
      windows: "claude",
      note: "Follow the browser login prompt. An ANTHROPIC_API_KEY can be used instead.",
    },
    run: {
      label: "Start a session",
      unix: "cd my-project && claude",
      windows: "cd my-project; claude",
    },
    example: {
      label: "Try it",
      unix: 'claude "Review the last commit and fix any failing tests"',
      windows: 'claude "Review the last commit and fix any failing tests"',
    },
    docsUrl: "https://code.claude.com/docs",
    siteUrl: "https://claude.com/product/claude-code",
    githubUrl: "https://github.com/anthropics/claude-code",
    accent: {
      text: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      gradient: "from-orange-500/20 to-amber-500/20",
    },
  },
  {
    id: "copilot-cli",
    name: "GitHub Copilot CLI",
    provider: "GitHub",
    tagline: "Your repo, issues, and PRs from the shell",
    description:
      "GitHub's terminal agent with native access to your repositories, issues, and pull requests. Ask it to explain code, implement a fix, or open a PR without leaving the shell.",
    category: "Terminal agent",
    pricing: "Requires a GitHub Copilot subscription",
    requires: ["Node.js 22+ (npm install)", "Active GitHub Copilot subscription"],
    install: {
      label: "Install",
      unix: "npm install -g @github/copilot",
      windows: "winget install GitHub.Copilot",
      note: "macOS/Linux alternative: brew install --cask copilot-cli",
    },
    auth: {
      label: "Authenticate",
      unix: "copilot",
      windows: "copilot",
      note: "Run /login inside the session and follow the device-code prompt.",
    },
    run: {
      label: "Start a session",
      unix: "cd my-project && copilot",
      windows: "cd my-project; copilot",
    },
    example: {
      label: "Try it",
      unix: 'copilot "Explain the architecture of this repository"',
      windows: 'copilot "Explain the architecture of this repository"',
    },
    docsUrl: "https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli",
    siteUrl: "https://github.com/features/copilot",
    githubUrl: "https://github.com/github/copilot-cli",
    accent: {
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      gradient: "from-purple-500/20 to-fuchsia-500/20",
    },
  },
  {
    id: "ollama",
    name: "Ollama",
    provider: "Ollama",
    tagline: "Run open models locally",
    description:
      "Run Llama, Gemma, Qwen, DeepSeek, and other open models on your own machine. No API keys, no per-token bill, and your data never leaves your computer.",
    category: "Local models",
    pricing: "Free and open source",
    requires: ["8 GB+ RAM for 7B models", "GPU recommended for larger models"],
    install: {
      label: "Install",
      unix: "curl -fsSL https://ollama.com/install.sh | sh",
      windows: "irm https://ollama.com/install.ps1 | iex",
      note: "macOS alternative: brew install ollama",
    },
    auth: {
      label: "Start the server",
      unix: "ollama serve",
      windows: "ollama serve",
      note: "The macOS app starts the server automatically. Skip this step if it is already running.",
    },
    run: {
      label: "Pull and run a model",
      unix: "ollama run llama3.1",
      windows: "ollama run llama3.1",
    },
    example: {
      label: "Try it",
      unix: 'ollama run llama3.1 "Write a Python script that renames files by date"',
      windows: 'ollama run llama3.1 "Write a Python script that renames files by date"',
    },
    docsUrl: "https://docs.ollama.com",
    siteUrl: "https://ollama.com",
    githubUrl: "https://github.com/ollama/ollama",
    accent: {
      text: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      gradient: "from-cyan-500/20 to-sky-500/20",
    },
  },
  {
    id: "gemini-api",
    name: "Gemini API",
    provider: "Google",
    tagline: "Call Gemini from your own code",
    description:
      "Use Gemini directly in scripts, agents, and backends. Install the SDK, export an API key, and make your first model call in under a minute.",
    category: "API",
    pricing: "Free tier available; pay-as-you-go for higher limits",
    requires: ["Python 3.9+ or Node.js 18+", "Gemini API key from Google AI Studio"],
    install: {
      label: "Install the SDK",
      unix: "pip install -U google-genai",
      windows: "pip install -U google-genai",
      note: "JavaScript/TypeScript alternative: npm install @google/genai",
    },
    auth: {
      label: "Set your API key",
      unix: 'export GEMINI_API_KEY="your-key-here"',
      windows: '$env:GEMINI_API_KEY="your-key-here"',
      note: "Create a key at aistudio.google.com/apikey",
    },
    run: {
      label: "Make your first call",
      unix: `python -c "from google import genai; print(genai.Client().models.generate_content(model='gemini-flash-latest', contents='Explain MCP in one sentence.').text)"`,
      windows: `python -c "from google import genai; print(genai.Client().models.generate_content(model='gemini-flash-latest', contents='Explain MCP in one sentence.').text)"`,
    },
    example: {
      label: "Try it",
      unix: `python -c "from google import genai; print(genai.Client().models.generate_content(model='gemini-flash-latest', contents='Write a haiku about AI agents.').text)"`,
      windows: `python -c "from google import genai; print(genai.Client().models.generate_content(model='gemini-flash-latest', contents='Write a haiku about AI agents.').text)"`,
    },
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    siteUrl: "https://ai.google.dev",
    accent: {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/20 to-yellow-500/20",
    },
  },
];

export const TOOL_CATEGORIES = [
  "All",
  "Terminal agent",
  "Agentic IDE",
  "Local models",
  "API",
] as const;
