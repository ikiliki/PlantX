process.env.PLANTX_ENV = 'mock'
process.env.PLANTX_SEED = 'demo'
process.env.PLANTX_DATA = 'data-local'
process.env.PORT = '8788'
await import('../server/src/index.ts')
