type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function log(level: LogLevel, message: string, error?: Error, data?: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj
    const sanitized = { ...obj }
    const secrets = ['password', 'token', 'secret', 'authorization']
    for (const key of Object.keys(sanitized)) {
      if (secrets.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key])
      }
    }
    return sanitized
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(error && { error: { message: error.message, stack: error.stack } }),
    ...(data && { data: sanitize(data) }),
  }

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(payload))
  } else {
    let output = `[${payload.timestamp}] ${level.toUpperCase()}: ${message}`
    if (error) output += `\nError: ${error.message}`
    if (data) output += `\nData: ${JSON.stringify(payload.data, null, 2)}`
    
    switch (level) {
      case 'info': console.info(output); break
      case 'warn': console.warn(output); break
      case 'error': console.error(output); break
      case 'debug': console.debug(output); break
    }
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log('info', message, undefined, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, undefined, data),
  error: (message: string, error?: Error, data?: Record<string, unknown>) => log('error', message, error, data),
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, undefined, data),
}
