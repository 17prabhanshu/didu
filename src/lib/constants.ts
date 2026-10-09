export const siteConfig = {
  name: 'Agentverse',
  description: 'An intelligence and discovery platform for the agentic internet.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/images/og-default.png',
  creator: 'Agentverse',
  keywords: ['AI agents', 'AI tools', 'AI models', 'MCP', 'agent security', 'agentic AI'],
  links: {
    twitter: '',
    github: '',
  },
} as const;

export const contentTypes = {
  article: 'Article',
  guide: 'Guide',
  agent: 'Agent',
  tool: 'Tool',
  model: 'Model',
  security: 'Security Update',
} as const;

export const contentStatuses = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
} as const;

export const userRoles = {
  admin: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  user: 'User',
} as const;

export const agentCategories = [
  'Coding',
  'Research',
  'Data Analysis',
  'Customer Support',
  'Writing',
  'Workflow Automation',
  'General Assistant',
  'Education',
  'Entertainment'
] as const;

export const toolCategories = [
  'Search',
  'API Wrapper',
  'File System',
  'Database',
  'Code Execution',
  'Browser',
  'Communication',
  'Deployment'
] as const;

export const modelProviders = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'Mistral',
  'Cohere',
  'Open Source'
] as const;

export const securityTopics = [
  'Prompt Injection',
  'Data Exfiltration',
  'Jailbreaking',
  'Authentication',
  'Access Control',
  'Auditing',
  'Hallucinations'
] as const;

export const guideTypes = [
  'Getting Started',
  'Best Practices',
  'Deployment',
  'Architecture',
  'Evaluation',
  'Development'
] as const;

export const severityLevels = [
  'low',
  'medium',
  'high',
  'critical'
] as const;
