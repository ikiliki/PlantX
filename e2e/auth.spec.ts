import { expect, test } from './support'

/**
 * Google sign-in only trusts tokens Google signed. Forged tokens carry every claim the server checks
 * (audience, issuer, expiry, verified email) but no valid signature, so each must get 401 and no session.
 * Nothing signs in or writes, so this also runs against production.
 */
test.describe('auth', { tag: '@prod' }, () => {
  const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')

  function forged(clientId: string, kid: string) {
    const header = b64({ alg: 'RS256', kid, typ: 'JWT' })
    const claims = b64({
      iss: 'https://accounts.google.com',
      aud: clientId,
      sub: '100000000000000000001',
      email: 'forged-admin@example.com',
      email_verified: true,
      name: 'Forged',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    return `${header}.${claims}.${Buffer.from('not a real signature').toString('base64url')}`
  }

  test('Google sign-in rejects forged ID tokens', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'API check; once is enough')
    const config = (await (await page.request.get('/api/session/google')).json()) as {
      enabled: boolean
      clientId: string | null
    }
    test.skip(!config.enabled || !config.clientId, 'Google sign-in is off here')

    const kids = ['forged-key']
    // A real Google key id makes the server check the signature itself, not just miss the key.
    const certs = await page.request.get('https://www.googleapis.com/oauth2/v3/certs').catch(() => null)
    if (certs?.ok()) {
      const realKid = ((await certs.json()) as { keys?: { kid?: string }[] }).keys?.[0]?.kid
      if (realKid) kids.push(realKid)
    }

    for (const kid of kids) {
      const res = await page.request.post('/api/session/google', {
        data: { credential: forged(config.clientId!, kid) },
      })
      expect(res.status(), `forged token with kid ${kid}`).toBe(401)
      expect(res.headers()['set-cookie'] ?? '', 'no session cookie').not.toContain('plantx_session')
    }
  })
})
