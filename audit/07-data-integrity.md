# Phase 7: Database, Backend, and Data Integrity

## Database Configuration

### Prisma Schema (`prisma/schema.prisma`)
- **Provider**: PostgreSQL (production), SQLite (dev mismatch)
- **Connection**: `DATABASE_URL` (pooled), `DIRECT_URL` (migrations)
- **Client**: Singleton pattern in `src/lib/db.ts` with dev caching

### Schema Overview (27 Models)

| Model | Purpose | Key Constraints |
|-------|---------|-----------------|
| `User` | Admin users | `@@unique([email])`, `role` string |
| `Session` | Auth sessions | `@@unique([token])`, `@@index([userId])` |
| `Author` | Content authors | `@@unique([slug])`, `@@index([userId])` |
| `Article` | Content articles | `@@unique([slug])`, multiple indexes |
| `Category` | Taxonomy | `@@unique([slug])`, self-referential |
| `Tag` | Tags | `@@unique([slug])` |
| `Agent` | AI agents directory | `@@unique([slug])`, status enum |
| `Tool` | AI tools directory | `@@unique([slug])`, status enum |
| `Model` | AI models directory | `@@unique([slug])`, status enum |
| `Framework` | Frameworks | `@@unique([slug])`, status enum |
| `MCPServer` | MCP servers | `@@unique([slug])`, status enum |
| `Company` | Companies | `@@unique([slug])` |
| `SecurityAlert` | Security advisories | `@@unique([slug])`, severity enum |
| `GlossaryTerm` | Glossary | `@@unique([slug])` |
| `MediaAsset` | Uploaded files | `@@index([uploadedById])` |
| `ExternalLink` | Article links | `@@index([articleId])` |
| `InternalLink` | Cross-refs | `@@index([sourceArticleId])` |
| `Redirect` | URL redirects | `@@unique([source])`, `@@index([active])` |
| `AuditLog` | Activity tracking | `@@index([userId])`, `@@index([entityType, entityId])` |
| `NewsletterSubscriber` | Subscribers | `@@unique([email])`, `@@index([status])` |
| `Comparison` | Comparisons | `@@unique([slug])`, `@@index([status])` |
| `Review` | Reviews | `@@unique([slug])`, `@@index([entityType, entityId])` |
| `ContributorProfile` | Contributors | `@@unique([userId])` |
| `ContactMessage` | Contact form | `@@index([status])` |
| `ArticleRevision` | Version history | `@@index([articleId])` |
| `ArticleTag` | Many-to-many | `@@unique([articleId, tagId])` |

---

## Data Integrity Analysis

### Constraints & Validation

| Area | Implementation | Status |
|------|----------------|--------|
| **Primary Keys** | All models have `@id @default(cuid())` | ✅ |
| **Unique Constraints** | Email, slug, token fields | ✅ |
| **Foreign Keys** | Prisma relations with `onDelete` | ✅ |
| **Cascade Deletes** | Configured on relations (Cascade/SetNull) | ✅ |
| **Required Fields** | Prisma required (no `?`) + Zod validation | ✅ |
| **Enums** | String fields (not native enums) | ⚠️ |
| **Check Constraints** | None at DB level | ❌ |
| **Triggers** | None | ❌ |

### Enum Implementation Risk
```prisma
// Current: String fields
role               String              // SUPER_ADMIN, EDITOR, AUTHOR...
status             String              // DRAFT, PUBLISHED, ARCHIVED...
contentType        String              // ARTICLE, NEWS, GUIDE...
severity           String              // CRITICAL, HIGH, MEDIUM...

// Risk: No DB-level constraint, typos possible
// Fix: Use Prisma native enums or CHECK constraints
```

### Index Analysis

#### Present (Good)
```prisma
// Article
@@index([status, publishedAt])  // Admin lists, public queries
@@index([contentType])          // Filter by type
@@index([authorId])             // Author articles
@@index([categoryId])           // Category articles
@@index([createdAt])            // Sorting

// Session
@@index([userId])               // User sessions

// AuditLog
@@index([userId])               // User activity
@@index([entityType, entityId]) // Entity history
```

#### Missing (Potential Performance Issues)
```prisma
// Article search uses: title, body, excerpt (insensitive LIKE)
// No trigram/GIN index for full-text search
// Consider: PostgreSQL tsvector + GIN index

// NewsletterSubscriber
// Queries by email (unique ✅), status (index ✅)

// ContactMessage
// Queries by status (index ✅)
```

---

## Migration Strategy

### Current State
- **No migration files** in `prisma/migrations/` (gitignored)
- **`db push`** used for dev schema sync
- **Production**: Requires `prisma migrate deploy`

### Required Migrations (from README)
```bash
# Create migration for NewsletterSubscriber.age column
npx prisma migrate dev --name add_newsletter_age

# In CI/CD:
npx prisma migrate deploy
```

### Migration Safety Checklist
| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible | ❓ Unknown | No migration history to verify |
| Destructive changes | ❓ Unknown | No migrations to review |
| Data migration scripts | ❌ None | Required for enum changes |
| Rollback procedure | ❌ Not documented | Need `migrate reset` or manual |
| Staging verification | ❌ Not tested | Required before production |

---

## Transaction Handling

### Current Usage
```typescript
// Most operations: Single Prisma calls (auto-transaction)
// Multi-step: No explicit transactions found
```

### Required Transactions (Not Implemented)
| Operation | Tables Involved | Risk |
|-----------|-----------------|------|
| Article publish + revision | Article, ArticleRevision | Partial publish |
| User creation + author profile | User, Author | Orphaned records |
| Category delete + article reassign | Category, Article | Data loss |
| Media upload + DB record | File storage, MediaAsset | Orphaned files/records |

### Recommendation
Add `$transaction` for multi-table operations:
```typescript
await db.$transaction([
  db.article.update({ where: { id }, data: { status: 'PUBLISHED' } }),
  db.articleRevision.create({ data: { articleId: id, ... } }),
]);
```

---

## Access Control (Database Level)

### Current: Application-Level Only
- **Row-Level Security (RLS)**: Not implemented
- **Database users**: Single application user
- **Authorization**: Enforced in API routes (`requireRole`)

### Risk Assessment
| Scenario | Current Protection | Gap |
|----------|-------------------|-----|
| Direct DB access | None | Admin with DB creds bypasses all auth |
| SQL injection | Prisma parameterized | ✅ Protected |
| IDOR | API checks ownership | ❌ Not in CRUD API (SEC-005) |
| Tenant isolation | N/A (single tenant) | N/A |

### Recommended: Application-Level (Current) + Audit Logging
Since this is a single-tenant CMS, application-level auth with comprehensive audit logging is acceptable if:
1. AuditLog is immutable (SEC-015)
2. All admin actions logged
3. Regular access reviews

---

## Backup & Recovery

### Current Configuration
- **Provider**: External (Supabase, Neon, Railway, etc.)
- **Backups**: Provider-managed (not in repo)
- **Point-in-time recovery**: Provider-dependent
- **RPO/RTO**: Not documented

### Required Documentation
```markdown
# Backup & Recovery Plan (TO BE CREATED)

## Backup Schedule
- Automated: Daily (provider)
- Manual: Before deployments

## Recovery Procedures
1. Point-in-time restore: [provider steps]
2. Full restore: [provider steps]
3. Partial restore (single table): [SQL commands]

## Testing
- Quarterly restore test to staging
- Document RTO: < 1 hour
- Document RPO: < 24 hours
```

---

## Data Retention & Privacy

### Personal Data Fields
| Model | PII Fields | Retention | Deletion Path |
|-------|------------|-----------|---------------|
| `User` | email, name, avatar | Indefinite | Admin delete (cascades sessions) |
| `Author` | name, bio, avatar, socialLinks | Indefinite | Admin delete |
| `ContributorProfile` | displayName, bio, avatar, website, socialLinks | Indefinite | User delete (cascade) |
| `NewsletterSubscriber` | email, age | Indefinite | Unsubscribe (soft delete) |
| `ContactMessage` | name, email, message | Indefinite | Admin delete |
| `Session` | token (hashed) | 30 min | Auto-expiry |
| `AuditLog` | userId (FK) | Indefinite | Not deletable (audit) |

### GDPR/CCPA Compliance Gaps
| Requirement | Status | Gap |
|-------------|--------|-----|
| Data export (portability) | ❌ | No endpoint |
| Data deletion (right to erasure) | ⚠️ Partial | Soft delete only for subscribers |
| Consent tracking | ❌ | Newsletter has age but no consent record |
| Data processing agreement | ❌ | Not documented |
| Retention policy | ❌ | Not defined |

### Recommended: Add Privacy Endpoints
```typescript
// GET /api/privacy/export - Returns all user data
// DELETE /api/privacy/delete - Anonymizes/deletes user data
// POST /api/privacy/consent - Records consent
```

---

## Seed Data & Migrations

### Seed Script (`prisma/seed.ts`)
- **237 lines** - Creates admin, authors, companies, categories, agents, tools, models, glossary, security alerts, articles
- **Idempotent**: Uses `upsert` - safe to re-run
- **Environment-aware**: Requires `ADMIN_PASSWORD` in production
- **Data quality**: Rich, realistic seed data for demos

### Issues
1. **Hardcoded passwords**: Dev default `'dev-only-change-me'` (line 16)
2. **No seed for test environment**: Separate test DB needed
3. **Large seed**: May timeout in CI/CD

---

## Connection Management

### Current (`src/lib/db.ts`)
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Query logging in dev | Low | OK for dev |
| No connection pooling config | Medium | Add `connection_limit` to DATABASE_URL |
| No prepared statement cache | Low | Prisma handles |
| No health check endpoint | Low | `/api/health` exists ✅ |

---

## Data Quality Issues

### From Seed Data Review
1. **Article bodies**: Plain text with markdown-like formatting (`# `, `## `, `- `)
2. **No content sanitization**: Stored as raw text, rendered with `dangerouslySetInnerHTML` equivalent
3. **External URLs**: Not validated for reachability
4. **Image URLs**: Unsplash (external dependency)

### Runtime Validation
- **Zod schemas** on all API inputs ✅
- **Magic byte validation** on uploads ✅
- **No output sanitization** for article bodies (rendered as HTML via markdown parsing)
- **XSS risk**: `article.body.split('\n\n').map(...)` renders as React elements but markdown headers become `<h1>` etc. - safe if no raw HTML allowed

---

## Summary & Recommendations

### Critical
1. **Add database CHECK constraints** for enum fields (role, status, contentType, severity)
2. **Implement transactions** for multi-table operations
3. **Document backup/recovery** procedures with RTO/RPO
4. **Add GDPR endpoints** for data export/deletion

### High
5. **Add full-text search index** for Article search
6. **Implement Row-Level Security** or document why not needed
7. **Add migration files** to version control (remove from .gitignore)
8. **Create staging environment** with production-like data

### Medium
9. **Add connection pool sizing** to DATABASE_URL
10. **Implement soft delete pattern** consistently (all models have `deletedAt`)
11. **Add data quality checks** (cron job for broken links, missing images)
12. **Document seed data** for new environments

### Low
13. **Consider Prisma native enums** for type safety
14. **Add database-level audit triggers** for immutable logs
15. **Implement read replicas** for scaling reads