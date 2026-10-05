import { clientEnv } from './plantxEnv'

/** Mock mode's operator persona. Live data keeps one admin on the server, so the role decides there. */
export const MOCK_OPERATOR_ID = 'u-admin'

/** The operator is the sole admin (the server keeps it so). Mock mode has other admin personas. */
export function isOperator(user: { id?: string; role?: string } | null | undefined) {
  if (!user || user.role !== 'admin') return false
  return clientEnv() !== 'mock' || user.id === MOCK_OPERATOR_ID
}

/** The public app is off. The operator and pre-approved members still enter. */
export function admitsWhenClosed(
  user: { id?: string; role?: string; preapproved?: boolean; accountStatus?: 'active' | 'disabled' } | null | undefined,
) {
  if (!user || user.role === 'guest') return false
  if ((user.accountStatus ?? 'active') === 'disabled') return false
  return isOperator(user) || Boolean(user.preapproved)
}
