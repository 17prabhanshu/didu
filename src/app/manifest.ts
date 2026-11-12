import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tecrese - The Intelligence Layer for the Agentic Internet',
    short_name: 'Tecrese',
    description:
      'Discover, compare, and integrate AI agents, tools, models, and MCP servers. Free guides and copy-paste setup.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#7C3AED',
    icons: [
      { src: '/images/brand/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/brand/favicon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/images/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
