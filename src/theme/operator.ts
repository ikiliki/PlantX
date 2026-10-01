/** Bootstrap operator. Admin is this Google account only. */
export const OPERATOR_EMAIL = 'omri96david@gmail.com'

export function isOperator(user: { email?: string; role?: string } | null | undefined) {
  if (!user || user.role !== 'admin') return false
  return user.email?.trim().toLowerCase() === OPERATOR_EMAIL
}
