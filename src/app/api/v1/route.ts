// API v1 Router - Central entry point for versioned API
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v1',
    status: 'active',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        me: 'GET /api/v1/auth/me',
        forgotPassword: 'POST /api/v1/auth/forgot-password',
        resetPassword: 'POST /api/v1/auth/reset-password',
        csrf: 'GET /api/v1/auth/csrf',
      },
      newsletter: {
        subscribe: 'POST /api/v1/newsletter',
        confirm: 'GET /api/v1/newsletter/confirm',
        unsubscribe: 'POST /api/v1/newsletter/unsubscribe',
      },
      contact: {
        submit: 'POST /api/v1/contact',
      },
      search: {
        search: 'GET /api/v1/search',
      },
      admin: {
        inbox: 'GET /api/v1/admin/inbox',
        inboxDetail: 'GET /api/v1/admin/inbox/:id',
        inboxReply: 'POST /api/v1/admin/inbox/:id',
        inboxStatus: 'PATCH /api/v1/admin/inbox/:id',
        subscribers: 'GET /api/v1/admin/subscribers',
        crud: {
          get: 'GET /api/v1/admin/crud',
          create: 'POST /api/v1/admin/crud',
          update: 'PUT /api/v1/admin/crud',
          delete: 'DELETE /api/v1/admin/crud',
        },
        articles: 'GET/POST /api/v1/admin/articles',
        agents: 'GET/POST /api/v1/admin/agents',
        tools: 'GET/POST /api/v1/admin/tools',
        models: 'GET/POST /api/v1/admin/models',
        categories: 'GET/POST /api/v1/admin/categories',
        tags: 'GET/POST /api/v1/admin/tags',
        authors: 'GET/POST /api/v1/admin/authors',
        securityAlerts: 'GET/POST /api/v1/admin/security-alerts',
        glossary: 'GET/POST /api/v1/admin/glossary',
        media: 'POST /api/v1/admin/upload',
        redirects: 'GET/POST /api/v1/admin/redirects',
        links: 'GET/POST /api/v1/admin/links',
        users: 'GET/POST /api/v1/admin/users',
        audit: 'GET /api/v1/admin/audit',
        settings: 'GET/PUT /api/v1/admin/settings',
      },
      cron: {
        cleanup: 'GET /api/v1/cron/cleanup-sessions',
      },
    },
    deprecation: {
      notice: 'API v1 is the current stable version. v0 endpoints will be deprecated.',
      sunsetDate: '2026-12-31',
    },
  });
}