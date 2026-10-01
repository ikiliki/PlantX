/** Bootstrap operator. Admin is this Google account only. */
export const OPERATOR_EMAIL = 'omri96david@gmail.com'

export function isOperator(user: { email?: string; role?: string } | null | undefined) {
  if (!user || user.role !== 'admin') return false
  return user.email?.trim().toLowerCase() === OPERATOR_EMAIL
}

/** The public app is off. The operator and pre-approved members still enter. */
export function admitsWhenClosed(
  user: { email?: string; role?: string; preapproved?: boolean; accountStatus?: 'active' | 'disabled' } | null | undefined,
) {
  if (!user || user.role === 'guest') return false
  if ((user.accountStatus ?? 'active') === 'disabled') return false
  return isOperator(user) || Boolean(user.preapproved)
}
