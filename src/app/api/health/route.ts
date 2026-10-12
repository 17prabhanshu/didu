import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`
    
    // Check Redis if configured (ignoring .env.example placeholders)
    let redisStatus = 'not_configured';
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (
      redisUrl &&
      redisToken &&
      redisUrl.startsWith('https://') &&
      !redisUrl.includes('your-redis.upstash.io') &&
      redisToken !== 'your_redis_rest_token_here'
    ) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: redisUrl,
          token: redisToken,
        });
        await Promise.race([
          redis.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 1500)),
        ]);
        redisStatus = 'connected';
      } catch {
        redisStatus = 'disconnected';
      }
    }

    const emailConfigured = Boolean(
      process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxxx'
    );
    const blobConfigured = Boolean(
      process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'vercel_blob_rw_token_here'
    );
    
    return NextResponse.json({
      status: 'healthy',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: 'connected',
        redis: redisStatus,
        email: emailConfigured ? 'configured' : 'not_configured',
        blobStorage: blobConfigured ? 'configured' : 'local_fallback',
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        version: 'v1.0.0',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'disconnected',
        },
      },
      { status: 503 }
    )
  }
}