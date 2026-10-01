process.env.PLANTX_ENV = 'prod'
process.env.PLANTX_SEED = 'empty'
process.env.PLANTX_DATA = 'data-prod'
process.env.PORT = process.env.PORT || '8789'
await import('../server/src/index.ts')
