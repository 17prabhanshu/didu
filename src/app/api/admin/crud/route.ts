import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

// Get available models from Prisma schema
const models = Prisma.dmmf.datamodel.models;

// Explicit field allowlists per model - ONLY these fields can be created/updated via generic CRUD
const MODEL_FIELD_ALLOWLISTS: Record<string, string[]> = {
  article: ['title', 'slug', 'subtitle', 'excerpt', 'body', 'contentType', 'status', 'categoryId', 'authorId', 'featuredImage', 'seoTitle', 'seoDescription', 'canonicalUrl', 'ogImage', 'twitterImage', 'keywords', 'focusKeyword', 'searchIntent', 'robotsDirective', 'breadcrumbTitle', 'sitemapInclusion', 'sitemapPriority', 'sitemapChangeFreq', 'redirectUrl', 'schemaType', 'readingTime', 'scheduledAt', 'publishedAt'],
  agent: ['name', 'slug', 'tagline', 'description', 'overview', 'companyId', 'categoryId', 'capabilities', 'modelUsed', 'integrations', 'pricing', 'pricingModel', 'deployment', 'openSource', 'mcpSupport', 'toolUsage', 'computerUse', 'browserUse', 'interfaces', 'securityInfo', 'privacyInfo', 'websiteUrl', 'officialUrl', 'githubUrl', 'docsUrl', 'logoUrl', 'status', 'featured'],
  tool: ['name', 'slug', 'tagline', 'description', 'overview', 'categoryId', 'companyId', 'language', 'framework', 'openSource', 'cloudHosted', 'selfHosted', 'pricing', 'websiteUrl', 'officialUrl', 'docsUrl', 'githubUrl', 'logoUrl', 'status', 'featured'],
  model: ['name', 'slug', 'provider', 'family', 'modality', 'contextWindow', 'reasoning', 'toolCalling', 'structuredOutputs', 'vision', 'audio', 'coding', 'agentSuitability', 'deploymentType', 'apiAvailable', 'pricingInput', 'pricingOutput', 'docsUrl', 'releaseDate', 'status', 'featured'],
  framework: ['name', 'slug', 'description', 'language', 'category', 'officialUrl', 'docsUrl', 'githubUrl', 'logoUrl', 'openSource', 'stars', 'status'],
  mcpserver: ['name', 'slug', 'description', 'provider', 'category', 'officialUrl', 'docsUrl', 'githubUrl', 'status'],
  securityalert: ['title', 'slug', 'severity', 'affectedSystems', 'affectedVersions', 'summary', 'technicalDetails', 'mitigation', 'references', 'cveId', 'cweId', 'affectedVendors', 'status', 'publishedAt'],
  glossaryterm: ['term', 'slug', 'definition', 'simpleExplanation', 'technicalExplanation', 'relatedTermIds', 'canonicalUrl'],
  category: ['name', 'slug', 'description', 'contentType', 'parentId'],
  tag: ['name', 'slug'],
  author: ['name', 'slug', 'bio', 'avatar', 'expertise', 'socialLinks', 'userId'],
  company: ['name', 'slug', 'description', 'website', 'logoUrl'],
  comparison: ['title', 'slug', 'description', 'entityType', 'entityIds', 'body', 'authorId', 'status'],
  review: ['title', 'slug', 'entityType', 'entityId', 'body', 'rating', 'authorId', 'status'],
  redirect: ['source', 'destination', 'statusCode', 'reason', 'active'],
  mediaasset: ['filename', 'url', 'altText', 'caption', 'description', 'attribution', 'copyright', 'mimeType', 'size', 'width', 'height', 'uploadedById'],
  contributorprofile: ['name', 'slug', 'bio', 'avatarUrl', 'websiteUrl', 'twitterHandle', 'githubHandle', 'linkedinUrl', 'expertise', 'approved', 'featured'],
  newslettersubscriber: ['email', 'age', 'status', 'subscribedAt', 'unsubscribedAt', 'confirmedAt'],
  contactmessage: ['name', 'email', 'subject', 'message', 'status'],
  user: ['email', 'name', 'role', 'avatar', 'bio', 'mustChangePassword'],
};

// System-level sensitive models that only SUPER_ADMIN can access
const SENSITIVE_MODELS = ['user', 'session', 'auditlog', 'role', 'passwordresettoken'];

function sanitizeInput(model: string, data: Record<string, unknown>): Record<string, unknown> {
  const allowlist = MODEL_FIELD_ALLOWLISTS[model.toLowerCase()];
  if (!allowlist) {
    throw new Error(`Model "${model}" not allowed for generic CRUD. Create a dedicated endpoint.`);
  }
  
  const sanitized: Record<string, unknown> = {};
  for (const key of allowlist) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }

  // Apply E-E-A-T editorial hygiene on bios, names, and external HTML links
  if (typeof sanitized.bio === 'string') {
    sanitized.bio = sanitized.bio
      .replace(/guest poster|guest writer|guest author/gi, 'Contributing Analyst')
      .replace(/guest post|sponsored post|paid post/gi, 'independent research');
  }
  if (typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.replace(/Guest|Sponsor/gi, 'Analyst');
  }
  if (typeof sanitized.body === 'string') {
    sanitized.body = sanitized.body.replace(/<a\s+([^>]*href="http[^"]*"[^>]*)>/gi, (match: string, inner: string) => {
      if (inner.includes('tecrese.com') || inner.includes('rel=')) return match;
      return `<a ${inner} rel="nofollow noopener noreferrer">`;
    });
  }

  return sanitized;
}

function generateSlug(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Date.now();
}

export async function GET(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']);
    
    const { searchParams } = new URL(req.url);
    const model = searchParams.get('model');
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (model && SENSITIVE_MODELS.includes(model.toLowerCase()) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }

    if (action === "schema" && model) {
      const modelSchema = models.find(m => m.name.toLowerCase() === model.toLowerCase());
      if (!modelSchema) return NextResponse.json({ error: "Model not found" }, { status: 404 });
      return NextResponse.json({ schema: modelSchema.fields });
    }

    if (model && id) {
      const record = await (db as any)[model].findUnique({ where: { id } });
      if (record && model.toLowerCase() === 'user' && 'passwordHash' in record) {
        const { passwordHash: _omitted, ...safeUser } = record;
        return NextResponse.json({ data: safeUser });
      }
      return NextResponse.json({ data: record });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR']);
    
    const body = await req.json();
    const { model, data } = body;
    
    if (!model || !data) {
      return NextResponse.json({ error: "Missing model or data" }, { status: 400 });
    }
    
    // SECURITY: Privilege Escalation Prevention
    if (SENSITIVE_MODELS.includes(model.toLowerCase()) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }

    // Validate model exists
    const modelExists = models.some(m => m.name.toLowerCase() === model.toLowerCase());
    if (!modelExists) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // Sanitize input - only allowlisted fields
    const sanitizedData = sanitizeInput(model, data);
    
    // Auto-generate slug if missing and model has slug field
    if (!sanitizedData.slug && (sanitizedData.title || sanitizedData.name || sanitizedData.term)) {
      const slugSource = sanitizedData.title || sanitizedData.name || sanitizedData.term;
      sanitizedData.slug = generateSlug(String(slugSource));
    }

    // Auto-inject authorId for models that require it
    if (['article', 'review'].includes(model.toLowerCase()) && !sanitizedData.authorId) {
      if ((db as any).author) {
        const fallbackAuthor =
          (await (db as any).author.findFirst()) ||
          (await (db as any).author.create({
            data: { name: "Intelligence Desk", slug: "intelligence-desk", bio: "Agentverse internal research team." },
          }));
        sanitizedData.authorId = fallbackAuthor.id;
      }
    }

    if (model.toLowerCase() === 'article' && !sanitizedData.contentType) {
      sanitizedData.contentType = 'RESEARCH';
    }

    // Default status for models that require it
    const modelsRequiringStatus = ['article', 'agent', 'tool', 'model', 'framework', 'mcpserver', 'securityalert', 'comparison', 'review'];
    if (modelsRequiringStatus.includes(model.toLowerCase()) && !sanitizedData.status) {
      sanitizedData.status = process.env.AUTO_APPROVE_SUBMISSIONS === 'true' ? 'PUBLISHED' : 'DRAFT';
    }

    // Default severity for security alerts
    if (model.toLowerCase() === 'securityalert' && !sanitizedData.severity) {
      sanitizedData.severity = 'INFO';
    }

    // Default comparison fields
    if (model.toLowerCase() === 'comparison') {
      if (!sanitizedData.entityType) sanitizedData.entityType = 'agent';
      if (!sanitizedData.entityIds) sanitizedData.entityIds = '[]';
    }

    // Default review fields
    if (model.toLowerCase() === 'review') {
      if (!sanitizedData.entityType) sanitizedData.entityType = 'agent';
      if (!sanitizedData.entityId) sanitizedData.entityId = 'unknown';
    }

    const result = await (db as any)[model].create({ data: sanitizedData });
    
    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: model,
      entityId: result.id,
      metadata: { fields: Object.keys(sanitizedData) },
      userId: session.userId,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR']);
    
    const body = await req.json();
    const { model, id, data } = body;
    
    if (!model || !id || !data) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    // SECURITY: Privilege Escalation Prevention
    if (SENSITIVE_MODELS.includes(model.toLowerCase()) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }

    // Validate model exists
    const modelExists = models.some(m => m.name.toLowerCase() === model.toLowerCase());
    if (!modelExists) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // Sanitize input - only allowlisted fields
    const sanitizedData = sanitizeInput(model, data);
    
    // Prevent slug changes on update
    delete sanitizedData.slug;

    const result = await (db as any)[model].update({ 
      where: { id }, 
      data: sanitizedData 
    });
    
    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: model,
      entityId: id,
      metadata: { fields: Object.keys(sanitizedData) },
      userId: session.userId,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

// 1-Click Approve & Bulk Auto-Approve endpoint
export async function PATCH(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR']);

    const { model, id, action } = await req.json();
    if (!model || !action) {
      return NextResponse.json({ error: "Missing model or action" }, { status: 400 });
    }

    const lowerModel = model.toLowerCase();
    if (SENSITIVE_MODELS.includes(lowerModel) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }

    const modelExists = models.some((m) => m.name.toLowerCase() === lowerModel);
    if (!modelExists) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    const isContributor = lowerModel === 'contributorprofile';
    const isArticle = lowerModel === 'article';
    const isContact = lowerModel === 'contactmessage';

    if (action === 'approve' && id) {
      const updatePayload: Record<string, unknown> = isContributor
        ? { approved: true }
        : isContact
        ? { status: 'READ' }
        : isArticle
        ? { status: 'PUBLISHED', publishedAt: new Date() }
        : { status: 'PUBLISHED' };

      const updated = await (db as any)[model].update({
        where: { id },
        data: updatePayload,
      });

      await createAuditLog({
        action: 'PUBLISH',
        entityType: model,
        entityId: id,
        metadata: updatePayload,
        userId: session.userId,
      });

      revalidatePath('/', 'layout');
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'bulk-approve') {
      const whereClause = isContributor
        ? { approved: false }
        : isContact
        ? { status: 'UNREAD' }
        : { status: { not: 'PUBLISHED' } };

      const updatePayload: Record<string, unknown> = isContributor
        ? { approved: true }
        : isContact
        ? { status: 'READ' }
        : isArticle
        ? { status: 'PUBLISHED', publishedAt: new Date() }
        : { status: 'PUBLISHED' };

      const batch = await (db as any)[model].updateMany({
        where: whereClause,
        data: updatePayload,
      });

      await createAuditLog({
        action: 'PUBLISH',
        entityType: model,
        entityId: 'bulk',
        metadata: { count: batch.count, ...updatePayload },
        userId: session.userId,
      });

      revalidatePath('/', 'layout');
      return NextResponse.json({ success: true, count: batch.count });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN']);
    
    const { searchParams } = new URL(req.url);
    const model = searchParams.get('model');
    const id = searchParams.get('id');
    
    if (!model || !id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // SECURITY: Prevent deletion of core auth/audit models via generic endpoint
    if (['session', 'auditlog', 'passwordresettoken'].includes(model.toLowerCase())) {
      return NextResponse.json({ error: "Use dedicated endpoint for this model" }, { status: 403 });
    }

    // Validate model exists
    const modelExists = models.some(m => m.name.toLowerCase() === model.toLowerCase());
    if (!modelExists) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    await (db as any)[model].delete({ where: { id } });
    
    // Audit log
    await createAuditLog({
      action: 'DELETE',
      entityType: model,
      entityId: id,
      userId: session.userId,
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}