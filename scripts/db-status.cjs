const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  try {
    const counts = {
      articles: await db.article.count(),
      publishedArticles: await db.article.count({ where: { status: 'PUBLISHED' } }),
      agents: await db.agent.count({ where: { status: 'PUBLISHED' } }),
      tools: await db.tool.count({ where: { status: 'PUBLISHED' } }),
      models: await db.model.count(),
      frameworks: await db.framework.count({ where: { status: 'PUBLISHED' } }),
      mcpServers: await db.mCPServer.count({ where: { status: 'PUBLISHED' } }),
      glossary: await db.glossaryTerm.count(),
      securityAlerts: await db.securityAlert.count(),
      authors: await db.author.count(),
      categories: await db.category.count(),
      subscribers: await db.newsletterSubscriber.count(),
      contactMessages: await db.contactMessage.count(),
    };
    console.log(JSON.stringify(counts, null, 2));

    const articles = await db.article.findMany({
      select: { title: true, slug: true, status: true, contentType: true },
      take: 20,
    });
    console.log('\nARTICLES:');
    for (const a of articles) console.log(`- [${a.status}/${a.contentType}] ${a.title} (${a.slug})`);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
})();
