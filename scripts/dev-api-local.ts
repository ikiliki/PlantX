process.env.PLANTX_ENV = 'local'
process.env.PLANTX_SEED = 'empty'
process.env.PLANTX_DATA = 'data'
process.env.PORT = '8787'
await import('../server/src/index.ts')
